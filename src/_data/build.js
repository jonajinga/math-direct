// A tag that changes with every build. Style and script addresses carry it,
// so a browser fetches the new files the first time it loads a new page
// instead of using copies saved from an earlier visit.
export default { version: Date.now().toString(36) };
