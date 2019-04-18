/* globals Tools Log Module*/
const _async = require("async");

Module.onStart = async function() {
    Log.debug("Cube " + Module.name + " is loaded.");

    let prefix;
    let count = 0;
    let start = new Date();

    //const transaction = await Application._.connection.driver.transaction();
    // for(let i=1; i<1000001; i++) {
    //     const newItem = await Cube.Catalogs.Brands.new();
    //     newItem.Name = "B " + new Date();
    //     await newItem.save();
    //     if (parseInt(i / 1000) === i / 1000) {
    //         const end = new Date();
    //         console.log("1000 items are saved for %d ms", end - start);
    //         start = new Date();
    //     }
    // }
    //transaction.commit()

    // const brands = await Cube.Catalogs.Brands.select();
    // const end = new Date();
    // console.log(end - start);
    // console.log(brands.length);
    // for(let i=0; i<brands.length; i++) {
    //     await brands[i].delete(true);
    //     if (parseInt(i / 1000) === i / 1000) {
    //         const end = new Date();
    //         console.log("1000 items are deleted for %d ms", end - start);
    //         console.log(i);
    //         start = new Date();
    //     }
    // };
}