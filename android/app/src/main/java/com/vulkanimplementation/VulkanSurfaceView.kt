package com.vulkanimplementation

import android.content.Context
import android.view.SurfaceHolder
import android.view.SurfaceView

class VulkanSurfaceView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {
    
    private var surfaceReadyCallback: ((SurfaceHolder) -> Unit)? = null
    private var isSurfaceReady = false

    init {
        holder.addCallback(this)
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        android.util.Log.i("VulkanSurfaceView", "Surface created")
        isSurfaceReady = true
        surfaceReadyCallback?.invoke(holder)
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        android.util.Log.i("VulkanSurfaceView", "Surface changed: ${width}x${height}")
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        android.util.Log.i("VulkanSurfaceView", "Surface destroyed")
        isSurfaceReady = false
    }

    fun setSurfaceReadyCallback(callback: (SurfaceHolder) -> Unit) {
        surfaceReadyCallback = callback
        if (isSurfaceReady) {
            callback(holder)
        }
    }
}