import { CubeTexture, CubeTextureLoader, LinearSRGBColorSpace } from "three";

const _loader = new CubeTextureLoader();

export default class Skybox {
    public texture: CubeTexture = new CubeTexture;
    public images: Array<string> | undefined;

    constructor(imgUrls: Array<string> | undefined) {
        this.images = imgUrls;
    }

    public load(imgUrls: Array<string>) {
        if (imgUrls.length !== 6) {
            console.error('Only need 6 images to make a skybox.');
            return;
        }
        return new Promise<CubeTexture>((resolve, reject) => {
            this.images = imgUrls;
            this.texture = _loader.load(
                imgUrls,
                () => {
                    this.texture.colorSpace = LinearSRGBColorSpace;
                    this.texture.matrixAutoUpdate = false;
                    this.texture.updateMatrix();
                    resolve(this.texture);
                },
                undefined,
                (e) => {
                    reject(e);
                }
            );
        });
    }

    public revokeImgUrls() {
        this.images?.forEach(url => URL.revokeObjectURL(url));
        this.images = undefined;
    }
}
