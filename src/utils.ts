function sleep(num: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, num);
  });
}

async function setValue(doc: Document, id: string, value: string) {
  await sleep(300);
  doc.getElementById(id)?.focus();
  await sleep(300);
  (doc.getElementById(id) || ({} as any)).value = value;
  await sleep(300);
  doc.getElementById(id)?.blur();
}

export { sleep, setValue };
