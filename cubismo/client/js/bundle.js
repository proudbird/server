const serverUrl = window.location.hostname + ":21021";
const server = io(serverUrl);

const attempts = 100000;
let count = 0;
let start;

server.on('connect', function (response) {
  console.log("server is connected");
  for(let i=0; i<attempts; i++) {
    test();
  }
});

function test() {
  start = start || new Date();
  server.emit("signal", "hi", (answer) => {
    if(answer === "catch") {
      count++;
      if(count === attempts) {
        const timeStamp = new Date();
        const delta = timeStamp - start;
        console.log(`${attempts} answers got for ${delta} ms`);
      }
      const result = count/1000;
      if(parseInt(result) === result) {
        const timeStamp = new Date();
        const delta = timeStamp - start;
        console.log(`+100 answers got for ${delta} ms`);
      }
    }
  });
}