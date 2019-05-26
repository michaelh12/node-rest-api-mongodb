function a() {
    return (
        new Promise(resolve => {
            console.log('before await');

            resolve({ LastName: 'habinsky' });
        })
    )
}
async function c() {
    let x = Promose.all(await [a()]);

    console.log(x);

}


async function b() {
    let x = await a();
    console.log('after function a...', x);
};

c();
console.log('after b');