package com.vulkanimplementation

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class VulkanPackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == VulkanModule.NAME) {
            VulkanModule(reactContext)
        } else {
            null
        }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(VulkanViewManager())
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                VulkanModule.NAME to ReactModuleInfo(
                    VulkanModule.NAME,
                    VulkanModule.NAME,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCxxModule - CHANGED FROM true TO false
                    false  // isTurboModule - CHANGED FROM true TO false
                )
            )
        }
    }
}