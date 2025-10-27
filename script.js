document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
    const rotationYSlider = document.getElementById('rotationY');
    const rotationYValueSpan = document.getElementById('rotationYValue');
    const rotationXSlider = document.getElementById('rotationX');
    const rotationXValueSpan = document.getElementById('rotationXValue');
    const rotationZSlider = document.getElementById('rotationZ'); // Z축 슬라이더 요소 추가
    const rotationZValueSpan = document.getElementById('rotationZValue'); // Z축 값 표시 span 추가

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 50; 

    // 1. 3D 도형 정의 (정육면체)
    const vertices = [
        [-1, -1, -1], // 0
        [ 1, -1, -1], // 1
        [ 1,  1, -1], // 2
        [-1,  1, -1], // 3
        [-1, -1,  1], // 4
        [ 1, -1,  1], // 5
        [ 1,  1,  1], // 6
        [-1,  1,  1]  // 7
    ];

    // 육면체의 모서리(edge) 정의
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // 뒷면
        [4, 5], [5, 6], [6, 7], [7, 4], // 앞면
        [0, 4], [1, 5], [2, 6], [3, 7]  // 옆면
    ];

    /**
     * 2-1. 3D 점을 Y축 기준으로 회전시킵니다.
     * @param {number[]} point [x, y, z] 형태의 3D 점
     * @param {number} angleYRad Y축 회전 각도 (라디안)
     * @returns {number[]} 회전된 3D 점 [x', y', z']
     */
    function rotateY(point, angleYRad) {
        const x = point[0];
        const y = point[1];
        const z = point[2];

        const x_rotated = x * Math.cos(angleYRad) + z * Math.sin(angleYRad);
        const z_rotated = -x * Math.sin(angleYRad) + z * Math.cos(angleYRad);
        
        return [x_rotated, y, z_rotated];
    }

    /**
     * 2-2. 3D 점을 X축 기준으로 회전시킵니다.
     * @param {number[]} point [x, y, z] 형태의 3D 점
     * @param {number} angleXRad X축 회전 각도 (라디안)
     * @returns {number[]} 회전된 3D 점 [x', y', z']
     */
    function rotateX(point, angleXRad) {
        const x = point[0];
        const y = point[1];
        const z = point[2];

        const y_rotated = y * Math.cos(angleXRad) - z * Math.sin(angleXRad);
        const z_rotated = y * Math.sin(angleXRad) + z * Math.cos(angleXRad);
        
        return [x, y_rotated, z_rotated];
    }

    /**
     * 2-3. 3D 점을 Z축 기준으로 회전시킵니다. (새로 추가)
     * @param {number[]} point [x, y, z] 형태의 3D 점
     * @param {number} angleZRad Z축 회전 각도 (라디안)
     * @returns {number[]} 회전된 3D 점 [x', y', z']
     */
    function rotateZ(point, angleZRad) {
        const x = point[0];
        const y = point[1];
        const z = point[2]; // Z축 회전이므로 Z좌표는 변하지 않음

        const x_rotated = x * Math.cos(angleZRad) - y * Math.sin(angleZRad);
        const y_rotated = x * Math.sin(angleZRad) + y * Math.cos(angleZRad);
        
        return [x_rotated, y_rotated, z];
    }

    /**
     * 3. 회전된 3D 점을 2D 화면 좌표로 정사영(Orthogonal Projection)하고 캔버스에 맞게 변환합니다.
     * @param {number[]} point3D [x, y, z] 형태의 3D 점
     * @returns {number[]} [screenX, screenY] 형태의 2D 화면 좌표
     */
    function project(point3D) {
        // 정사영은 Z 좌표를 버리고, X와 Y 좌표만 사용하여 2D 투영
        const projectedX = point3D[0];
        const projectedY = point3D[1];

        // 캔버스 중앙으로 이동 및 스케일 적용
        const screenX = centerX + projectedX * scale;
        const screenY = centerY - projectedY * scale; // Canvas의 Y축은 아래로 향하므로 반전

        return [screenX, screenY];
    }

    /**
     * 4. 캔버스에 정육면체를 그립니다.
     */
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;

        // 현재 회전 각도 가져오기 및 라디안으로 변환
        const currentRotationY = parseFloat(rotationYSlider.value);
        rotationYValueSpan.textContent = `${currentRotationY}°`;
        const angleYRad = (currentRotationY * Math.PI) / 180;

        const currentRotationX = parseFloat(rotationXSlider.value);
        rotationXValueSpan.textContent = `${currentRotationX}°`;
        const angleXRad = (currentRotationX * Math.PI) / 180;

        const currentRotationZ = parseFloat(rotationZSlider.value); // Z축 회전 각도 가져오기
        rotationZValueSpan.textContent = `${currentRotationZ}°`;
        const angleZRad = (currentRotationZ * Math.PI) / 180;

        // 회전 순서: Y축 -> X축 -> Z축 (적용 순서에 따라 결과가 다름)
        let transformedVertices = vertices.map(v => rotateY(v, angleYRad)); // 1. Y축 회전
        transformedVertices = transformedVertices.map(v => rotateX(v, angleXRad)); // 2. X축 회전
        const rotatedVertices = transformedVertices.map(v => rotateZ(v, angleZRad)); // 3. Z축 회전 (최종 회전된 꼭짓점)
        
        const projectedPoints = rotatedVertices.map(v => project(v));

        edges.forEach(edge => {
            const p1 = projectedPoints[edge[0]];
            const p2 = projectedPoints[edge[1]];

            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
        });

        // 각 꼭짓점을 작은 원으로 표시 (선택 사항)
        ctx.fillStyle = 'red';
        projectedPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 슬라이더 값이 변경될 때마다 다시 그리기
    rotationYSlider.addEventListener('input', draw);
    rotationXSlider.addEventListener('input', draw);
    rotationZSlider.addEventListener('input', draw); // Z축 슬라이더 이벤트 리스너 추가

    // 초기 그리기
    draw();
});