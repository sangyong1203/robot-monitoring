import { ref, watch, type Ref } from 'vue'

export function useAuthenticatedMapImage(urlRef: Ref<string | undefined | null>) {
    const imageSource = ref<string>('')
    const imageLoadFailed = ref<boolean>(false)

    watch(
        () => urlRef.value,
        url => {
            imageLoadFailed.value = false
            imageSource.value = url || ''
        },
        { immediate: true },
    )

    return {
        imageSource,
        imageLoadFailed,
    }
}
