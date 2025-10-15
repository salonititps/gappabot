package com.vulkanimplementation

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class VulkanViewManager : SimpleViewManager<VulkanSurfaceView>() {
    
    override fun getName(): String = "VulkanView"

    override fun createViewInstance(reactContext: ThemedReactContext): VulkanSurfaceView {
        return VulkanSurfaceView(reactContext)
    }
}