package com.ghostmesh.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GhostMeshBLEPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
