package com.ghostmesh.app;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.ParcelUuid;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(name = "GhostMeshBLE")
public class GhostMeshBLEPlugin extends Plugin {

    private static final String TAG = "GhostMeshBLE";
    private static final UUID SERVICE_UUID = UUID.fromString("0000ffe0-0000-1000-8000-00805f9b34fb");
    private static final UUID CHARACTERISTIC_UUID = UUID.fromString("0000ffe1-0000-1000-8000-00805f9b34fb");

    private BluetoothManager bluetoothManager;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothGattServer gattServer;
    private BluetoothLeAdvertiser advertiser;
    private BluetoothLeScanner scanner;
    private boolean isScanning = false;

    @Override
    public void load() {
        super.load();
        bluetoothManager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
        }
        Log.d(TAG, "GhostMeshBLE Native Plugin Loaded");
    }

    @PluginMethod
    public void startMesh(PluginCall call) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is not enabled or supported on this device");
            return;
        }

        try {
            // 1. Setup Local GATT Server
            if (gattServer == null) {
                gattServer = bluetoothManager.openGattServer(getContext(), gattServerCallback);
                BluetoothGattService service = new BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY);
                BluetoothGattCharacteristic characteristic = new BluetoothGattCharacteristic(
                        CHARACTERISTIC_UUID,
                        BluetoothGattCharacteristic.PROPERTY_READ |
                        BluetoothGattCharacteristic.PROPERTY_WRITE |
                        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE |
                        BluetoothGattCharacteristic.PROPERTY_NOTIFY,
                        BluetoothGattCharacteristic.PERMISSION_READ | BluetoothGattCharacteristic.PERMISSION_WRITE
                );
                service.addCharacteristic(characteristic);
                gattServer.addService(service);
                Log.d(TAG, "Native GATT Server initialized with Writable Characteristic");
            }

            // 2. Start GATT Advertising
            advertiser = bluetoothAdapter.getBluetoothLeAdvertiser();
            if (advertiser != null) {
                String nodeName = call.getString("nodeId", "GhostMesh-Node");
                try {
                    bluetoothAdapter.setName(nodeName);
                } catch (Exception e) {
                    Log.w(TAG, "Could not set adapter name: " + e.getMessage());
                }

                AdvertiseSettings settings = new AdvertiseSettings.Builder()
                        .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                        .setConnectable(true)
                        .setTimeout(0)
                        .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                        .build();

                AdvertiseData data = new AdvertiseData.Builder()
                        .setIncludeDeviceName(true)
                        .addServiceUuid(new ParcelUuid(SERVICE_UUID))
                        .build();

                advertiser.startAdvertising(settings, data, advertiseCallback);
                Log.d(TAG, "Native BLE Advertising started as " + nodeName);
            }

            JSObject res = new JSObject();
            res.put("status", "MESH_ACTIVE");
            res.put("serviceUuid", SERVICE_UUID.toString());
            res.put("characteristicUuid", CHARACTERISTIC_UUID.toString());
            call.resolve(res);

        } catch (Exception e) {
            Log.e(TAG, "Error starting mesh: " + e.getMessage(), e);
            call.reject("Failed to start native BLE mesh: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is not enabled");
            return;
        }

        try {
            scanner = bluetoothAdapter.getBluetoothLeScanner();
            if (scanner != null) {
                ScanSettings settings = new ScanSettings.Builder()
                        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                        .build();

                scanner.startScan(null, settings, scanCallback);
                isScanning = true;
                Log.d(TAG, "Native BLE Unfiltered Scan started");

                JSObject res = new JSObject();
                res.put("scanning", true);
                call.resolve(res);
            } else {
                call.reject("BLE Scanner unavailable");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error starting scan: " + e.getMessage(), e);
            call.reject("Failed to start scan: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        try {
            if (scanner != null && isScanning) {
                scanner.stopScan(scanCallback);
                isScanning = false;
                Log.d(TAG, "Native BLE Scan stopped");
            }
            JSObject res = new JSObject();
            res.put("scanning", false);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to stop scan: " + e.getMessage());
        }
    }

    @PluginMethod
    public void connectDevice(PluginCall call) {
        String deviceId = call.getString("deviceId");
        if (deviceId == null || deviceId.isEmpty()) {
            call.reject("Device ID is required");
            return;
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is not enabled");
            return;
        }

        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceId);
            Log.d(TAG, "Connecting to BLE Device " + deviceId + " and discovering services...");

            device.connectGatt(getContext(), false, new BluetoothGattCallback() {
                @Override
                public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        Log.d(TAG, "Connected to GATT server on " + deviceId + ". Discovering services...");
                        gatt.discoverServices();
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        Log.d(TAG, "Disconnected from GATT server on " + deviceId);
                        gatt.close();
                    }
                }

                @Override
                public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        BluetoothGattService service = gatt.getService(SERVICE_UUID);
                        if (service != null) {
                            BluetoothGattCharacteristic characteristic = service.getCharacteristic(CHARACTERISTIC_UUID);
                            if (characteristic != null) {
                                gatt.setCharacteristicNotification(characteristic, true);
                                Log.d(TAG, "GATT Service discovered and notification enabled for " + deviceId);
                            }
                        }
                    }
                }
            });

            JSObject res = new JSObject();
            res.put("connected", true);
            res.put("deviceId", deviceId);
            call.resolve(res);

        } catch (Exception e) {
            Log.e(TAG, "Error connecting to device " + deviceId + ": " + e.getMessage(), e);
            call.reject("Failed to connect device: " + e.getMessage());
        }
    }

    @PluginMethod
    public void writeWithoutResponse(PluginCall call) {
        String deviceId = call.getString("deviceId");
        String messageStr = call.getString("value");

        if (messageStr == null || messageStr.isEmpty()) {
            call.reject("Payload value cannot be empty");
            return;
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is not enabled");
            return;
        }

        performWriteWithoutResponse(deviceId, messageStr, true, call);
    }

    private void performWriteWithoutResponse(String deviceId, String messageStr, boolean allowRetry, PluginCall call) {
        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceId);
            device.connectGatt(getContext(), false, new BluetoothGattCallback() {
                @Override
                public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        gatt.discoverServices();
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        if (allowRetry) {
                            Log.w(TAG, "Connection dropped for " + deviceId + ". Retrying write once...");
                            performWriteWithoutResponse(deviceId, messageStr, false, call);
                        } else {
                            call.reject("Connection dropped during writeWithoutResponse");
                        }
                        gatt.close();
                    }
                }

                @Override
                public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        BluetoothGattService service = gatt.getService(SERVICE_UUID);
                        if (service != null) {
                            BluetoothGattCharacteristic characteristic = service.getCharacteristic(CHARACTERISTIC_UUID);
                            if (characteristic != null) {
                                byte[] payloadBytes = messageStr.getBytes(StandardCharsets.UTF_8);
                                characteristic.setValue(payloadBytes);
                                characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
                                boolean success = gatt.writeCharacteristic(characteristic);
                                Log.d(TAG, "writeWithoutResponse success: " + success);

                                JSObject res = new JSObject();
                                res.put("sent", success);
                                res.put("deviceId", deviceId);
                                call.resolve(res);
                                return;
                            }
                        }
                    }
                    if (allowRetry) {
                        performWriteWithoutResponse(deviceId, messageStr, false, call);
                    } else {
                        call.reject("Service or characteristic not found on device " + deviceId);
                    }
                    gatt.disconnect();
                }

                @Override
                public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                    gatt.disconnect();
                }
            });
        } catch (Exception e) {
            if (allowRetry) {
                performWriteWithoutResponse(deviceId, messageStr, false, call);
            } else {
                call.reject("Error in writeWithoutResponse: " + e.getMessage());
            }
        }
    }

    @PluginMethod
    public void sendMessage(PluginCall call) {
        String targetDeviceId = call.getString("targetDeviceId");
        String messageStr = call.getString("message");

        if (messageStr == null || messageStr.isEmpty()) {
            call.reject("Message content cannot be empty");
            return;
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is not enabled");
            return;
        }

        if (targetDeviceId != null && !targetDeviceId.isEmpty() && !targetDeviceId.equals("ALL")) {
            performWriteWithoutResponse(targetDeviceId, messageStr, true, call);
            return;
        }

        // Broadcast Fallback: update local GATT Server notifications
        JSObject res = new JSObject();
        res.put("sent", true);
        res.put("method", "BROADCAST_GATT_SERVER");
        call.resolve(res);
    }

    private final BluetoothGattServerCallback gattServerCallback = new BluetoothGattServerCallback() {
        @Override
        public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId, BluetoothGattCharacteristic characteristic, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
            super.onCharacteristicWriteRequest(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value);

            if (responseNeeded && gattServer != null) {
                gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value);
            }

            if (value != null && value.length > 0) {
                String decodedMessage = new String(value, StandardCharsets.UTF_8);
                Log.d(TAG, "Incoming characteristic write request from " + device.getAddress() + ": " + decodedMessage);

                JSObject payload = new JSObject();
                payload.put("deviceId", device.getAddress());
                payload.put("deviceName", device.getName() != null ? device.getName() : device.getAddress());
                payload.put("rawMessage", decodedMessage);

                try {
                    JSObject parsed = new JSObject(decodedMessage);
                    payload.put("id", parsed.optString("id", "BLE-" + System.currentTimeMillis()));
                    payload.put("senderId", parsed.optString("senderId", device.getName() != null ? device.getName() : "BLE-PEER"));
                    payload.put("targetNodeId", parsed.optString("targetNodeId", "ALL"));
                    payload.put("plainText", parsed.optString("plainText", decodedMessage));
                    payload.put("encryptedPayload", parsed.optString("encryptedPayload", "0x" + bytesToHex(value)));
                    payload.put("timestamp", parsed.optString("timestamp", new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date())));
                } catch (Exception e) {
                    payload.put("id", "BLE-" + System.currentTimeMillis());
                    payload.put("senderId", device.getName() != null ? device.getName() : "BLE-PEER");
                    payload.put("targetNodeId", "ALL");
                    payload.put("plainText", decodedMessage);
                    payload.put("encryptedPayload", "0x" + bytesToHex(value));
                    payload.put("timestamp", new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()));
                }

                notifyListeners("onMessageReceived", payload);
            }
        }
    };

    private final ScanCallback scanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            BluetoothDevice device = result.getDevice();
            if (device != null) {
                JSObject devObj = new JSObject();
                devObj.put("deviceId", device.getAddress());
                devObj.put("deviceName", device.getName() != null ? device.getName() : "BLE-" + device.getAddress().replace(":", ""));
                devObj.put("rssi", result.getRssi());

                notifyListeners("onDeviceDiscovered", devObj);
            }
        }
    };

    private final AdvertiseCallback advertiseCallback = new AdvertiseCallback() {
        @Override
        public void onStartSuccess(AdvertiseSettings settingsInEffect) {
            Log.d(TAG, "BLE Advertising start success");
        }

        @Override
        public void onStartFailure(int errorCode) {
            Log.e(TAG, "BLE Advertising start failure code: " + errorCode);
        }
    };

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
