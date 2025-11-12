
export class ImageLoadingOptimizer {
    
    
    constructor() {

    }

    private handleNewImage(image: HTMLImageElement) {
        image.loading="lazy";
        image.decoding="async";
    }

    private createMutationObserver() {
        const callback: MutationCallback = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            if (node.tagName == 'IMG') {
                                this.handleNewImage(node as HTMLImageElement);
                            }
                        }
                    })
                }
            }
        }

        const observer = new MutationObserver(callback);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    private processCurrentImages() {
        document.querySelectorAll("img").forEach((img) => {
            this.handleNewImage(img as HTMLImageElement);
        });
    }

    onLoad() {
        console.log("Begin optimizing image loading")
        this.processCurrentImages();
        this.createMutationObserver();
    }
}