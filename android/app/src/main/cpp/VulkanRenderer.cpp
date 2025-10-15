#include <jni.h>
#include <android/log.h>
#include <android/native_window_jni.h>

// Include Vulkan headers in correct order
#define VK_USE_PLATFORM_ANDROID_KHR
#include <vulkan/vulkan.h>
#include <vulkan/vulkan_android.h>

#include <vector>
#include <string>

#define LOG_TAG "VulkanRenderer"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

class VulkanRenderer {
private:
    VkInstance instance = VK_NULL_HANDLE;
    VkPhysicalDevice physicalDevice = VK_NULL_HANDLE;
    VkDevice device = VK_NULL_HANDLE;
    VkQueue queue = VK_NULL_HANDLE;
    VkSurfaceKHR surface = VK_NULL_HANDLE;
    VkSwapchainKHR swapchain = VK_NULL_HANDLE;
    std::vector<VkImage> swapchainImages;
    std::vector<VkImageView> swapchainImageViews;
    VkRenderPass renderPass = VK_NULL_HANDLE;
    std::vector<VkFramebuffer> framebuffers;
    VkCommandPool commandPool = VK_NULL_HANDLE;
    VkCommandBuffer commandBuffer = VK_NULL_HANDLE;
    VkSemaphore imageAvailableSemaphore = VK_NULL_HANDLE;
    VkSemaphore renderFinishedSemaphore = VK_NULL_HANDLE;
    uint32_t queueFamilyIndex = 0;
    VkExtent2D swapchainExtent;

public:
    bool initialize(ANativeWindow* window) {
        if (!createInstance()) return false;
        if (!createSurface(window)) return false;
        if (!selectPhysicalDevice()) return false;
        if (!createDevice()) return false;
        if (!createSwapchain(window)) return false;
        if (!createImageViews()) return false;
        if (!createRenderPass()) return false;
        if (!createFramebuffers()) return false;
        if (!createCommandPool()) return false;
        if (!createCommandBuffer()) return false;
        if (!createSemaphores()) return false;
        
        LOGI("Vulkan initialized successfully!");
        return true;
    }

    void render(float r, float g, float b) {
        uint32_t imageIndex;
        vkAcquireNextImageKHR(device, swapchain, UINT64_MAX, 
                              imageAvailableSemaphore, VK_NULL_HANDLE, &imageIndex);

        VkCommandBufferBeginInfo beginInfo = {};
        beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
        beginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;
        
        vkBeginCommandBuffer(commandBuffer, &beginInfo);

        VkRenderPassBeginInfo renderPassInfo = {};
        renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
        renderPassInfo.renderPass = renderPass;
        renderPassInfo.framebuffer = framebuffers[imageIndex];
        renderPassInfo.renderArea.offset = {0, 0};
        renderPassInfo.renderArea.extent = swapchainExtent;

        VkClearValue clearColor = {{{r, g, b, 1.0f}}};
        renderPassInfo.clearValueCount = 1;
        renderPassInfo.pClearValues = &clearColor;

        vkCmdBeginRenderPass(commandBuffer, &renderPassInfo, VK_SUBPASS_CONTENTS_INLINE);
        vkCmdEndRenderPass(commandBuffer);
        vkEndCommandBuffer(commandBuffer);

        VkSubmitInfo submitInfo = {};
        submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
        submitInfo.waitSemaphoreCount = 1;
        submitInfo.pWaitSemaphores = &imageAvailableSemaphore;
        VkPipelineStageFlags waitStages[] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};
        submitInfo.pWaitDstStageMask = waitStages;
        submitInfo.commandBufferCount = 1;
        submitInfo.pCommandBuffers = &commandBuffer;
        submitInfo.signalSemaphoreCount = 1;
        submitInfo.pSignalSemaphores = &renderFinishedSemaphore;

        vkQueueSubmit(queue, 1, &submitInfo, VK_NULL_HANDLE);

        VkPresentInfoKHR presentInfo = {};
        presentInfo.sType = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR;
        presentInfo.waitSemaphoreCount = 1;
        presentInfo.pWaitSemaphores = &renderFinishedSemaphore;
        presentInfo.swapchainCount = 1;
        presentInfo.pSwapchains = &swapchain;
        presentInfo.pImageIndices = &imageIndex;

        vkQueuePresentKHR(queue, &presentInfo);
        vkQueueWaitIdle(queue);
    }

    void cleanup() {
        if (device) vkDeviceWaitIdle(device);
        
        if (imageAvailableSemaphore) vkDestroySemaphore(device, imageAvailableSemaphore, nullptr);
        if (renderFinishedSemaphore) vkDestroySemaphore(device, renderFinishedSemaphore, nullptr);
        if (commandPool) vkDestroyCommandPool(device, commandPool, nullptr);
        
        for (auto framebuffer : framebuffers) {
            vkDestroyFramebuffer(device, framebuffer, nullptr);
        }
        
        if (renderPass) vkDestroyRenderPass(device, renderPass, nullptr);
        
        for (auto imageView : swapchainImageViews) {
            vkDestroyImageView(device, imageView, nullptr);
        }
        
        if (swapchain) vkDestroySwapchainKHR(device, swapchain, nullptr);
        if (surface) vkDestroySurfaceKHR(instance, surface, nullptr);
        if (device) vkDestroyDevice(device, nullptr);
        if (instance) vkDestroyInstance(instance, nullptr);
        
        LOGI("Vulkan cleaned up");
    }

private:
    bool createInstance() {
        VkApplicationInfo appInfo = {};
        appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
        appInfo.pApplicationName = "React Native Vulkan";
        appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
        appInfo.pEngineName = "No Engine";
        appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
        appInfo.apiVersion = VK_API_VERSION_1_0;

        std::vector<const char*> extensions = {
            VK_KHR_SURFACE_EXTENSION_NAME,
            VK_KHR_ANDROID_SURFACE_EXTENSION_NAME
        };

        VkInstanceCreateInfo createInfo = {};
        createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
        createInfo.pApplicationInfo = &appInfo;
        createInfo.enabledExtensionCount = static_cast<uint32_t>(extensions.size());
        createInfo.ppEnabledExtensionNames = extensions.data();

        if (vkCreateInstance(&createInfo, nullptr, &instance) != VK_SUCCESS) {
            LOGE("Failed to create Vulkan instance");
            return false;
        }
        
        LOGI("Vulkan instance created");
        return true;
    }

    bool createSurface(ANativeWindow* window) {
        VkAndroidSurfaceCreateInfoKHR createInfo = {};
        createInfo.sType = VK_STRUCTURE_TYPE_ANDROID_SURFACE_CREATE_INFO_KHR;
        createInfo.window = window;

        if (vkCreateAndroidSurfaceKHR(instance, &createInfo, nullptr, &surface) != VK_SUCCESS) {
            LOGE("Failed to create surface");
            return false;
        }
        
        LOGI("Surface created");
        return true;
    }

    bool selectPhysicalDevice() {
        uint32_t deviceCount = 0;
        vkEnumeratePhysicalDevices(instance, &deviceCount, nullptr);
        
        if (deviceCount == 0) {
            LOGE("No Vulkan-capable devices found");
            return false;
        }

        std::vector<VkPhysicalDevice> devices(deviceCount);
        vkEnumeratePhysicalDevices(instance, &deviceCount, devices.data());
        physicalDevice = devices[0];
        
        VkPhysicalDeviceProperties properties;
        vkGetPhysicalDeviceProperties(physicalDevice, &properties);
        LOGI("Physical device selected: %s", properties.deviceName);
        return true;
    }

    bool createDevice() {
        uint32_t queueFamilyCount = 0;
        vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, nullptr);
        
        std::vector<VkQueueFamilyProperties> queueFamilies(queueFamilyCount);
        vkGetPhysicalDeviceQueueFamilyProperties(physicalDevice, &queueFamilyCount, queueFamilies.data());

        for (uint32_t i = 0; i < queueFamilyCount; i++) {
            VkBool32 surfaceSupport = false;
            vkGetPhysicalDeviceSurfaceSupportKHR(physicalDevice, i, surface, &surfaceSupport);
            
            if (queueFamilies[i].queueFlags & VK_QUEUE_GRAPHICS_BIT && surfaceSupport) {
                queueFamilyIndex = i;
                break;
            }
        }

        float queuePriority = 1.0f;
        VkDeviceQueueCreateInfo queueCreateInfo = {};
        queueCreateInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queueCreateInfo.queueFamilyIndex = queueFamilyIndex;
        queueCreateInfo.queueCount = 1;
        queueCreateInfo.pQueuePriorities = &queuePriority;

        std::vector<const char*> deviceExtensions = {
            VK_KHR_SWAPCHAIN_EXTENSION_NAME
        };

        VkDeviceCreateInfo createInfo = {};
        createInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
        createInfo.queueCreateInfoCount = 1;
        createInfo.pQueueCreateInfos = &queueCreateInfo;
        createInfo.enabledExtensionCount = static_cast<uint32_t>(deviceExtensions.size());
        createInfo.ppEnabledExtensionNames = deviceExtensions.data();

        if (vkCreateDevice(physicalDevice, &createInfo, nullptr, &device) != VK_SUCCESS) {
            LOGE("Failed to create logical device");
            return false;
        }

        vkGetDeviceQueue(device, queueFamilyIndex, 0, &queue);
        LOGI("Logical device created");
        return true;
    }

    bool createSwapchain(ANativeWindow* window) {
        VkSurfaceCapabilitiesKHR capabilities;
        vkGetPhysicalDeviceSurfaceCapabilitiesKHR(physicalDevice, surface, &capabilities);

        swapchainExtent = capabilities.currentExtent;
        if (swapchainExtent.width == UINT32_MAX) {
            int32_t width = ANativeWindow_getWidth(window);
            int32_t height = ANativeWindow_getHeight(window);
            swapchainExtent.width = static_cast<uint32_t>(width);
            swapchainExtent.height = static_cast<uint32_t>(height);
        }

        uint32_t imageCount = capabilities.minImageCount + 1;
        if (capabilities.maxImageCount > 0 && imageCount > capabilities.maxImageCount) {
            imageCount = capabilities.maxImageCount;
        }

        VkSwapchainCreateInfoKHR createInfo = {};
        createInfo.sType = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
        createInfo.surface = surface;
        createInfo.minImageCount = imageCount;
        createInfo.imageFormat = VK_FORMAT_R8G8B8A8_UNORM;
        createInfo.imageColorSpace = VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
        createInfo.imageExtent = swapchainExtent;
        createInfo.imageArrayLayers = 1;
        createInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
        createInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
        createInfo.preTransform = capabilities.currentTransform;
        createInfo.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
        createInfo.presentMode = VK_PRESENT_MODE_FIFO_KHR;
        createInfo.clipped = VK_TRUE;

        if (vkCreateSwapchainKHR(device, &createInfo, nullptr, &swapchain) != VK_SUCCESS) {
            LOGE("Failed to create swapchain");
            return false;
        }

        vkGetSwapchainImagesKHR(device, swapchain, &imageCount, nullptr);
        swapchainImages.resize(imageCount);
        vkGetSwapchainImagesKHR(device, swapchain, &imageCount, swapchainImages.data());
        
        LOGI("Swapchain created with %d images", imageCount);
        return true;
    }

    bool createImageViews() {
        swapchainImageViews.resize(swapchainImages.size());

        for (size_t i = 0; i < swapchainImages.size(); i++) {
            VkImageViewCreateInfo createInfo = {};
            createInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
            createInfo.image = swapchainImages[i];
            createInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
            createInfo.format = VK_FORMAT_R8G8B8A8_UNORM;
            createInfo.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
            createInfo.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            createInfo.subresourceRange.baseMipLevel = 0;
            createInfo.subresourceRange.levelCount = 1;
            createInfo.subresourceRange.baseArrayLayer = 0;
            createInfo.subresourceRange.layerCount = 1;

            if (vkCreateImageView(device, &createInfo, nullptr, &swapchainImageViews[i]) != VK_SUCCESS) {
                LOGE("Failed to create image view %zu", i);
                return false;
            }
        }
        
        LOGI("Image views created");
        return true;
    }

    bool createRenderPass() {
        VkAttachmentDescription colorAttachment = {};
        colorAttachment.format = VK_FORMAT_R8G8B8A8_UNORM;
        colorAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
        colorAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
        colorAttachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
        colorAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
        colorAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
        colorAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
        colorAttachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

        VkAttachmentReference colorAttachmentRef = {};
        colorAttachmentRef.attachment = 0;
        colorAttachmentRef.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

        VkSubpassDescription subpass = {};
        subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
        subpass.colorAttachmentCount = 1;
        subpass.pColorAttachments = &colorAttachmentRef;

        VkRenderPassCreateInfo renderPassInfo = {};
        renderPassInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
        renderPassInfo.attachmentCount = 1;
        renderPassInfo.pAttachments = &colorAttachment;
        renderPassInfo.subpassCount = 1;
        renderPassInfo.pSubpasses = &subpass;

        if (vkCreateRenderPass(device, &renderPassInfo, nullptr, &renderPass) != VK_SUCCESS) {
            LOGE("Failed to create render pass");
            return false;
        }
        
        LOGI("Render pass created");
        return true;
    }

    bool createFramebuffers() {
        framebuffers.resize(swapchainImageViews.size());

        for (size_t i = 0; i < swapchainImageViews.size(); i++) {
            VkImageView attachments[] = {swapchainImageViews[i]};

            VkFramebufferCreateInfo framebufferInfo = {};
            framebufferInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
            framebufferInfo.renderPass = renderPass;
            framebufferInfo.attachmentCount = 1;
            framebufferInfo.pAttachments = attachments;
            framebufferInfo.width = swapchainExtent.width;
            framebufferInfo.height = swapchainExtent.height;
            framebufferInfo.layers = 1;

            if (vkCreateFramebuffer(device, &framebufferInfo, nullptr, &framebuffers[i]) != VK_SUCCESS) {
                LOGE("Failed to create framebuffer %zu", i);
                return false;
            }
        }
        
        LOGI("Framebuffers created");
        return true;
    }

    bool createCommandPool() {
        VkCommandPoolCreateInfo poolInfo = {};
        poolInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
        poolInfo.queueFamilyIndex = queueFamilyIndex;
        poolInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;

        if (vkCreateCommandPool(device, &poolInfo, nullptr, &commandPool) != VK_SUCCESS) {
            LOGE("Failed to create command pool");
            return false;
        }
        
        LOGI("Command pool created");
        return true;
    }

    bool createCommandBuffer() {
        VkCommandBufferAllocateInfo allocInfo = {};
        allocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        allocInfo.commandPool = commandPool;
        allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
        allocInfo.commandBufferCount = 1;

        if (vkAllocateCommandBuffers(device, &allocInfo, &commandBuffer) != VK_SUCCESS) {
            LOGE("Failed to allocate command buffer");
            return false;
        }
        
        LOGI("Command buffer created");
        return true;
    }

    bool createSemaphores() {
        VkSemaphoreCreateInfo semaphoreInfo = {};
        semaphoreInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;

        if (vkCreateSemaphore(device, &semaphoreInfo, nullptr, &imageAvailableSemaphore) != VK_SUCCESS ||
            vkCreateSemaphore(device, &semaphoreInfo, nullptr, &renderFinishedSemaphore) != VK_SUCCESS) {
            LOGE("Failed to create semaphores");
            return false;
        }
        
        LOGI("Semaphores created");
        return true;
    }
};

static VulkanRenderer* renderer = nullptr;

extern "C" JNIEXPORT jboolean JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeInitVulkan(
    JNIEnv* env, jobject thiz, jobject surface) {
    
    ANativeWindow* window = ANativeWindow_fromSurface(env, surface);
    if (!window) {
        LOGE("Failed to get native window");
        return JNI_FALSE;
    }

    renderer = new VulkanRenderer();
    bool success = renderer->initialize(window);
    
    return success ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeRender(
    JNIEnv* env, jobject thiz, jfloat r, jfloat g, jfloat b) {
    
    if (renderer) {
        renderer->render(r, g, b);
    }
}

extern "C" JNIEXPORT void JNICALL
Java_com_vulkanimplementation_VulkanModule_nativeCleanup(
    JNIEnv* env, jobject thiz) {
    
    if (renderer) {
        renderer->cleanup();
        delete renderer;
        renderer = nullptr;
    }
}