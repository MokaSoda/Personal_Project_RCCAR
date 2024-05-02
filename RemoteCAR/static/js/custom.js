var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;
let hostname = '192.168.12.1';

async function getFileFromUrl(url, name, defaultType = 'image/jpeg'){
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], name, {
      type: data.type || defaultType,
    });
  }
  
document.getElementById("list-captured").addEventListener("click", function () {
    window.location.href = "viewimage";
});


document.getElementById("capture-button").addEventListener("click", async function () {
    let snapshotdocuid = 'videosnapshot';
    let snapshoturl = 'http://' + robot_IP + ':8080/snapshot?topic=/usb_cam/image_raw';
    let uploadurl = 'snapshot'
    let base64data

    const file = await getFileFromUrl(snapshoturl, 'snapshot.jpg');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        base64data = reader.result;
        document.getElementById(snapshotdocuid).src = base64data;
        document.getElementsByClassName('captured')[0].hidden = false
        let jsonpostdata = {
            'url': base64data,
        };
        
        $.ajax({
            url: uploadurl,
            type: 'POST',
            data: JSON.stringify(jsonpostdata),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                console.log(response);
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            }
        });


    }
})



function moveAction(linear, angular) {
    if (linear !== undefined && angular !== undefined) {
        twist.linear.x = linear;
        twist.angular.z = angular;
    } else {
        twist.linear.x = 0;
        twist.angular.z = 0;
    }
    cmdVel.publish(twist);
}

function initVelPub() {
    // 전달해줄 메시지를 새로 정의함
    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // 제어를 위한 토픽 정의
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
    // 토픽이 있음을 마스터 노드에 전달함
    cmdVel.advertise();
}

function initTeleopKeyboard() {
    // 방향키로 제어

    // 키보드 컨트롤러가 생성되었는지 확인
    if (teleop == null) {
        teleop = new KEYBOARDTELEOP.Teleop({
            ros: ros,
            topic: '/cmd_vel'
        });
    }

    // 슬라이더 값을 변환
    robotSpeedRange = document.getElementById("robot-speed");
    robotSpeedRange.oninput = function () {
        teleop.scale = robotSpeedRange.value / 100
    }
}

function createJoystick() {
    if (manager == null) {
        joystickContainer = document.getElementById('joystick');
        var options = {
            zone: joystickContainer,
            position: { left: 50 + '%', top: 105 + 'px' },
            mode: 'static',
            size: 200,
            color: '#0066ff',
            restJoystick: true
        };
        manager = nipplejs.create(options);
        manager.on('move', function (evt, nipple) {
            var direction = nipple.angle.degree - 90;
            if (direction > 180) {
                direction = -(450 - nipple.angle.degree);
            }
            var lin = Math.cos(direction / 57.29) * nipple.distance * 0.005;
            var ang = Math.sin(direction / 57.29) * nipple.distance * 0.05;
            if (publishImmidiately) {
                publishImmidiately = false;
                moveAction(lin, ang);
                setTimeout(function () {
                    publishImmidiately = true;
                }, 50);
            }
        });
        manager.on('end', function () {
            moveAction(0, 0);
        });
    }
    document.getElementById("texthowto").hidden = false;
}

window.onload = function () {
    robot_IP = "192.168.12.1";

    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });

    initVelPub();
    video = document.getElementById('video');
    video.src = "http://" + robot_IP + ":8080/stream?topic=/usb_cam/image_raw";
    video.onload = function () {
        createJoystick();
        initTeleopKeyboard();
    };
}