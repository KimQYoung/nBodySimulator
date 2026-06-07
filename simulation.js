const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

// 마우스 좌표 저장 변수
let mouseX = 0;
let mouseY = 0;

// 마우스 좌표 업데이트
canvas.addEventListener('mousemove', (event) => {
    mouseX = event.offsetX;
    mouseY = event.offsetY;

    // 화면 크기 맞춤
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 중력 상수와 시뮬레이션에 사용할 물체의 개수.
const G = 0.0000152587890625; // 중력 상수(임의 값)

// 초기화 버튼
document.getElementById('resetButton').addEventListener('click', () => {
    bodies = [];
    bodies.push(new Body(750, 350, 33000000, 0, 0, 200, 'orange'))
})

// 천체 목록 저장
let bodies = [];

// 물체를 나타내는 클래스 정의
class Body {
    constructor(x, y, mass, vx, vy, r, color) {
        this.x = x;       // 물체의 x 좌표
        this.y = y;       // 물체의 y 
        this.mass = mass; // 물체의 질량
        this.vx = vx;      // x 방향 속도
        this.vy = vy;      // y 방향 속도
        this.radius = r;   // 반지름
        this.trail = [];  // 궤적을 저장할 배열
        this.color = color  // 천체의 색
        this.initposition = {x: 0, y: 0}; // 처음 위치 저장
        this.perimeter = 0; // 궤도 지름
    }


    // 물체의 위치와 속도를 업데이트
    update(bodies) {
        // 다른 모든 물체와의 상호작용을 계산
        for (let body of bodies) {
            if (body !== this) { // 자신과의 상호작용을 무시
                let dx = body.x - this.x; // x 방향 거리
                let dy = body.y - this.y; // y 방향 거리
                let distance = Math.sqrt(dx * dx + dy * dy); // 두 물체 간의 거리
                if (distance > 0) { // 0으로 나누는 것을 피하기 위해 거리 확인
                    let force = (G * this.mass * body.mass) / (distance * distance); // 중력의 크기
                    let angle = Math.atan2(dy, dx); // 중력의 방향
                    let fx = force * Math.cos(angle); // x 방향 중력
                    let fy = force * Math.sin(angle); // y 방향 중력
                    
                    // 속도 업데이트
                    this.vx += fx / this.mass;
                    this.vy += fy / this.mass;
                    
                }
            }
        }
        
        // 위치 업데이트
        this.x += this.vx;
        this.y += this.vy;
        
        // 현재 위치를 궤적 배열에 추가
        this.trail.push({ x: this.x, y: this.y });
        
    }
    
    // 물체와 궤적을 그리는 메서드
    draw() {
        // 궤적을 그림.
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y); // 궤적의 시작점을 이동.
        for (let point of this.trail) {
            ctx.lineTo(point.x, point.y); // 궤적의 각 점을 연결.
        }
        ctx.lineWidth = 0.5; // 궤적 두께
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // 궤적 색.
        ctx.stroke(); // 궤적을 그리기.
        
        // 물체를 그립니다.
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.sqrt(this.radius), 0, 2 * Math.PI); // 물체를 원으로.
        ctx.fillStyle = this.color; // 물체 색.
        ctx.fill(); // 색 채우기.
    }
    
    
}


// bodies.push(new Body(x, y, mass, vx, vy, radius, 'color'))
// 기본 천체
bodies.push(new Body(750, 350, 33000000, 0, 0, 200, 'orange'))
bodies.push(new Body(1000, 350, 1, 0, 1, 50, 'blue'));
bodies.push(new Body(1050, 350, 1, 0, 1, 50, 'green'));

// 천체들의 처음 위치 저장
for (body of bodies) {
    body.initposition = {x: body.x, y: body.y}
}

// 공전 주기를 계산할 변수
let startTime = null;
let orbitalPeriod = null;
let initialPosition = null;

// 천체 값 계산
function calculateOrbitalParameters() {
    const sun = bodies[0];      // 중심 천체 설정
    
    // console.log('자ㅏㄱ동함');
    for (let body of bodies) {
        if (body === sun) continue;
        
        let minDistance = Infinity;
        let maxDistance = 0;
        
        // 중심 천체와의 거리 계산
        for (let point of body.trail) {
            let dx = point.x - sun.x;
            let dy = point.y - sun.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
            }
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
        
        // 공전 궤도
        const semiMajorAxis = (minDistance + maxDistance) / 2;      // 긴 반지름
        const focalDistance = (maxDistance - minDistance) / 2;      // 초점과 중심사이의 거리
        const semiMinorAxis = Math.sqrt(semiMajorAxis * semiMajorAxis - focalDistance * focalDistance);     // 짧은 반지름
        const eccentricity = focalDistance / semiMajorAxis;     // 이심률 
        const px = (body.x - (body.initposition.x - semiMajorAxis));        // 공전 궤도의 중심이 원점일 때 천체의 x좌표
        const py = (body.y - body.initposition.y);      // 공전 궤도의 중심이 원점일 때 천체의 y좌표
        const position = ((px * px) / (semiMajorAxis * semiMajorAxis)) + ((py * py) / (semiMinorAxis * semiMinorAxis))  // 타원 방정식 계산
        body.perimeter = 2 * Math.PI * (Math.sqrt((semiMajorAxis * semiMajorAxis + semiMinorAxis * semiMinorAxis) / 2))    // 타원 둘레 계산
        
        
        // 공전 주기 계산
        if (startTime === null) {
            startTime = performance.now(); // 시작 시간 설정
            initialPosition = { x: body.x, y: body.y }; // 초기 위치 설정
        } else {
            const currentTime = performance.now();
            const dx = body.x - initialPosition.x;
            const dy = body.y - initialPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 특정 위치에 다시 도달했는지 확인 
            if (distance < 10 && orbitalPeriod === null || eccentricity >= 1) {
                orbitalPeriod = (currentTime - startTime);
                
                
                // 구한 값 콘솔에 출력
                console.log(`색이 ${body.color}인 천체와 중심 별`);
                console.log(`천체의 공전 주기: ${orbitalPeriod / 1000} 초`);
                console.log(`공전주기^2/궤도 긴반지름^3: ${(orbitalPeriod*orbitalPeriod) / (semiMajorAxis * semiMajorAxis * semiMajorAxis)}`);
                console.log(`중심과 초점 사이의 거리: ${focalDistance}`);
                console.log(`궤도 긴 반지름: ${semiMajorAxis}`);
                console.log(`궤도 짧은 반지름: ${semiMinorAxis}`);
                console.log(`이심률: ${eccentricity}`);
                console.log(`x^2/a^2+y^2/b^2 (x, y 천체의 좌표, a와 b 각각 긴 반지름, 짧은 반지름)의 값: ${position}`);
                console.log(``);
                
                // 다음 주기를 계산하기 위해 초기화
                initialPosition = { x: body.x, y: body.y };
                startTime = null;
                orbitalPeriod = null;
                
            }
        }   
    }
}

// 애니메이션 루프를 정의.
function animate() {
    // 천체의 궤적이 일정 길이 이상일 때 삭제
    // 캔버스 지우기.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 각 물체를 업데이트하고 그림.
    for (let body of bodies) {
        body.update(bodies);
        body.draw();
        
        // 마우스 좌표
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`(X:${mouseX}, Y:${mouseY})`, 20, 20);
                
        if (body.trail.length > body.perimeter) {
             body.trail.shift();
        }
    }
    
    // 다음 프레임을 요청.
    requestAnimationFrame(animate);
}

// 긴 반지름과 짧은 반지름, 두 초점 사이 거리, 타원 방정식 구하기


// 새로운 천체 추가 값을 불러옴
document.getElementById('addBodyButton').addEventListener('click', () => {
    const x = parseFloat(document.getElementById('x').value);
    const y = parseFloat(document.getElementById('y').value);
    const mass = parseFloat(document.getElementById('mass').value);
    const radius = parseFloat(document.getElementById('radius').value);
    const vx = parseFloat(document.getElementById('vx').value || 0);
    const vy = parseFloat(document.getElementById('vy').value|| 0);
    const color = document.getElementById('color').value || 'white';


    //새로운 천체 추가
    if (!isNaN(x) && !isNaN(y) && !isNaN(mass) && !isNaN(radius) && !isNaN(vx) && !isNaN(vy)) {
        bodies.push(new Body(x, y, mass, vx, vy, radius, color));
    } else {
        alert('모든 값을 올바르게 입력하세요.');
    }
});

// 애니메이션을 시작.
animate();

// 천체 값 계산 함수를 100ms마다 실행
setInterval(() => {
    if (bodies.length > 1) {
        calculateOrbitalParameters();
    }
}, 100);