import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// プレーンジオメトリの作成（多めのセグメント）
const geometry = new THREE.PlaneGeometry(2, 4, 10, 20); // 縦に長いジオメトリ

// スキンインデックスとスキンウェイトの設定
const vertexCount = geometry.attributes.position.count;
const skinIndices = [];
const skinWeights = [];

for (let i = 0; i < vertexCount; i++) {
    const y = geometry.attributes.position.getY(i);

    // ジオメトリのY座標に応じてボーンの影響を割り当て
    if (y < -1) {
        skinIndices.push(0, 1, 2, 0); // ボーン0とボーン1の影響
        skinWeights.push(0.4, 0.2, 0.4, 0);
    } else if (y < 1) {
        skinIndices.push(1, 2, 0, 0); // ボーン1とボーン2の影響
        skinWeights.push(0.5, 0.5, 0, 0);
    } else {
        skinIndices.push(2, 3, 0, 0); // ボーン2とボーン3の影響
        skinWeights.push(0.3, 0.7, 0, 0);
    }
}

geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

// ボーンの作成
const rootBone = new THREE.Bone();
const bone1 = new THREE.Bone();
const bone2 = new THREE.Bone();
const bone3 = new THREE.Bone();

// ボーンを階層構造で接続
rootBone.add(bone1);
bone1.add(bone2);
bone2.add(bone3);

// ボーンの位置を設定（間隔を調整）
bone1.position.y = 1;
bone2.position.y = 1;
bone3.position.y = 1;
// ボーンの可視化（SkeletonHelper を使用）
const skeletonHelper = new THREE.SkeletonHelper(rootBone);
scene.add(skeletonHelper);
// スケルトンを作成
const skeleton = new THREE.Skeleton([rootBone, bone1, bone2, bone3]);

// スキンメッシュを作成
const material = new THREE.MeshStandardMaterial({
    color: 0xff5533,
    side: THREE.DoubleSide,
    skinning: true,
    wireframe: true,
});
const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
skinnedMesh.add(rootBone);
skinnedMesh.bind(skeleton);
scene.add(skinnedMesh);

// 環境光と平行光源を追加
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// アニメーションループ
const clock = new THREE.Clock();

function animate() {
    const time = clock.getElapsedTime();
    // 各ボーンを動かす（例: 回転や揺れを追加）
    bone1.rotation.z = Math.sin(time) * 0.5; // ボーン1を揺らす
    bone2.rotation.z = Math.sin(time + 1) * 0.5; // ボーン2をずらして揺らす
    bone3.rotation.z = Math.sin(time + 2) * 0.5; // ボーン3をさらにずらす

    rootBone.position.y = Math.sin(time) * 0.5; // ルートボーンを上下に動かす

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();