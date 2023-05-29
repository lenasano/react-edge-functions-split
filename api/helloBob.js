export async function sayHello(person) {
  const delay = person === 'Bob' ? 2000 : 200;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(person + ' says hello.');
    }, delay);
  })
}