import { CubeTexture, CubeTextureLoader } from "three";

const _loader = new CubeTextureLoader();

export default class Skybox {
    public texture: CubeTexture;
    public images: Array<string>;

    constructor(imgUrls: Array<string>) {
        this.images = imgUrls;
        this.load(imgUrls).then((texture: CubeTexture) => {
            this.texture = texture;
        });
    }

    load(imgUrls: Array<string>) {
        if (imgUrls.length !== 6) {
            console.error('Only need 6 images to make a skybox.');
            return;
        }
        return new Promise((resolve, reject) => {
            this.images = imgUrls;
            this.texture = _loader.load(
                imgUrls,
                () => {
                    this.texture.matrixAutoUpdate = false;
                    this.texture.updateMatrix();
                    resolve(this.texture);
                },
                null,
                (e) => {
                    reject(e);
                }
            );
        });
    }
}
