async function test() {
    const result = await add(2,3);
    console.log('Result: ', result);
}

function add(no1, no2) {
    return new Promise((resolve, reject) => {
        resolve(no1 + no2);
    });
}

test();