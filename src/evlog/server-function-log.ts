interface ServerFunctionMetadata {
  export?: unknown;
}

const serverFunctionPrefix = "/_serverFn/";
const serverFunctionExportSuffix = "_createServerFn_handler";

export function getServerFunctionName(path: string) {
  if (!path.startsWith(serverFunctionPrefix)) {
    return undefined;
  }

  const [encodedMetadata] = path.slice(serverFunctionPrefix.length).split("/");

  if (!encodedMetadata) {
    return undefined;
  }

  try {
    const metadata = JSON.parse(
      atob(encodedMetadata.replaceAll("-", "+").replaceAll("_", "/"))
    ) as ServerFunctionMetadata;

    if (typeof metadata.export !== "string") {
      return undefined;
    }

    return metadata.export.endsWith(serverFunctionExportSuffix)
      ? metadata.export.slice(0, -serverFunctionExportSuffix.length)
      : metadata.export;
  } catch {
    return undefined;
  }
}
