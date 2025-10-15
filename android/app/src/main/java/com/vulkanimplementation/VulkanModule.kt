package com.vulkanimplementation

import android.view.Surface
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.UiThreadUtil

@ReactModule(name = VulkanModule.NAME)
class VulkanModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "VulkanModule"
        
        init {
            System.loadLibrary("vulkan_renderer")
        }
    }

    private var isVulkanInitialized = false

    override fun getName(): String = NAME

    external fun nativeInitVulkan(surface: Surface): Boolean
    external fun nativeRender(r: Float, g: Float, b: Float)
    external fun nativeCleanup()

    @ReactMethod
    fun initVulkan(viewTag: Int) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager = reactApplicationContext.getNativeModule(com.facebook.react.uimanager.UIManagerModule::class.java)
                uiManager?.addUIBlock { nativeViewHierarchyManager ->
                    val vulkanView = nativeViewHierarchyManager.resolveView(viewTag) as? VulkanSurfaceView
                    if (vulkanView != null) {
                        vulkanView.setSurfaceReadyCallback { holder ->
                            if (!isVulkanInitialized) {
                                val surface = holder.surface
                                if (surface.isValid) {
                                    val success = nativeInitVulkan(surface)
                                    if (success) {
                                        isVulkanInitialized = true
                                        android.util.Log.i(NAME, "Vulkan initialized successfully")
                                    } else {
                                        android.util.Log.e(NAME, "Failed to initialize Vulkan")
                                    }
                                } else {
                                    android.util.Log.e(NAME, "Surface is not valid")
                                }
                            }
                        }
                    } else {
                        android.util.Log.e(NAME, "Could not find VulkanSurfaceView")
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e(NAME, "Failed to initialize Vulkan: ${e.message}", e)
            }
        }
    }

    @ReactMethod
    fun render(r: Double, g: Double, b: Double) {
        if (isVulkanInitialized) {
            nativeRender(r.toFloat(), g.toFloat(), b.toFloat())
        } else {
            android.util.Log.w(NAME, "Vulkan not initialized, cannot render")
        }
    }

    @ReactMethod
    fun cleanup() {
        if (isVulkanInitialized) {
            nativeCleanup()
            isVulkanInitialized = false
        }
    }
}