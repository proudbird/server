View.onLoad = async function() {
  const constraints = {
    video: true,
    audio: true
  };

  View.Mirror.streamFromCam(constraints);
}