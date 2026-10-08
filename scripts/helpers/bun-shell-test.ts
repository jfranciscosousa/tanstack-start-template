// oxlint-disable-next-line id-length -- Tests resolve Bun's shell export by name.
export function $(): never {
  throw new Error("Tests must mock the Bun shell");
}
