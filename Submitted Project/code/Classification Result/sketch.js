let video;
let poseNet;
let pose;
let skeleton;
let brain;
let a, i;
var k;
var selectedLabel;
let o = prompt("Please enter the asana you want help with :- ");
let state = "waiting";
let targetLabel;

/*
function processSelection() {
  // Get the selection element
  var select = document.getElementById("mySelect");
  
  // Get the selected option's value
  
  var selectedValue = select.value;
  
  // Do something with the selected value
  console.log("You selected: " + selectedValue);
}
*/
/*
function keyPressed() {
  if (key == "s") {
    brain.saveData();
  } else {
    targetLabel = key;
    console.log(targetLabel);
    setTimeout(function () {
      console.log("collecting");
      state = "collecting";
      setTimeout(function () {
        console.log("not collecting");
        state = "waiting";
      }, 10000);
    }, 10000);
  }
}
*/
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  let options = {
    inputs: 34,
    outputs: 3,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "500_epoch_all/model.json",
    metadata: "500_epoch_all/model_meta.json",
    weights: "500_epoch_all/model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
  //brain.loadData("daw.json", dataReady);
}

function brainLoaded() {
  console.log("Pose Classification Ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      //let score = pose.keyPoints[i].score;
      inputs.push(x);
      inputs.push(y);
      //inputs.push(score);
    }

    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  selectedValue = o;
  //selectedValue='uttana shishoasana';
  //if(selectedValue != 0){}
  k = selectedValue;
  for (i = 0; i < 20; i++) {
    if (results[i].label == k) {
      selectedLabel = i;
    }
  }
  //}

  //k=selectedLabel;
  console.log(results[selectedLabel].confidence);

  // Set the value of the range element to the confidence value
  document.getElementById("myRange").value = results[selectedLabel].confidence;

  // Update the label with the confidence value
  document.getElementById("rangeLabel").innerHTML =
    results[selectedLabel].confidence;

  // Check if the confidence value is greater than 0.5
  if (results[selectedLabel].confidence > 0.5) {
    // Create a new Audio object
    var audio = new Audio();

    // Set the audio file to play
    audio.src = "ring_sound.mp3";

    // Set the volume to full (1)
    audio.volume = 1;

    // Play the audio file
    audio.play();
  }

  /*
  if (results[0].label == a) {
    a = results[0].label;
  } else {
    console.log(results);
    console.log(results[0].label);
    a = results[0].label;
  }
  */
  classifyPose();
}
/*
function dataReady() {
  brain.normalizeData();
  brain.train({ epochs: 100 }, finished);
}

function finished() {
  console.log("model trained");
  brain.save();
}
*/
function gotPoses(poses) {
  //console.log(poses);

  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;

    if (state == "collecting") {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        //let score = pose.keyPoints[i].score;
        inputs.push(x);
        inputs.push(y);
        //inputs.push(score);
      }
      let target = [targetLabel];

      brain.addData(inputs, target);
    }
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  image(video, 0, 0);
  //background(200);

  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    fill(0, 255, 255);
    ellipse(pose.nose.x, pose.nose.y, d / 2);
    fill(0, 255, 255);
    ellipse(pose.rightWrist.x, pose.rightWrist.y, 16);
    ellipse(pose.leftWrist.x, pose.leftWrist.y, 16);

    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0, 255, 255);
      ellipse(x, y, 16, 16);
    }
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0, 255, 255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
}
