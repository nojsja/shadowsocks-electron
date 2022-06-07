export default function randomPicker(total: any[], count: number) {
  const result: any[] = [];
  total = total.slice();

  let num = total.length;
  for (let i = 0; i < count; i++) {
      const index = ~~(Math.random() * num) + i;
      if(result.includes(total[index])) continue;
      result[i] = total[index];
      total[index] = total[i];
      num--;
  }

  return result;
}
