const version = 0.1;
const schemaSemverDivTag = "schema-semver";
const schemaSemverVersionDivTag = "schema-semver-version";
// TODO change this to the value you want to be displayed
const schemaSemverVersionLabel = "Meta-Version: ";
// note this can be the schema registry base url in the control center or a call directly to the schema registry
// TODO adjust accordingly
const schemaRegistryAPIPath =
  "http://localhost:9999/api/schema-registry/ce80cc169f6ea97056504dcdcba9a2e5e4f554ab";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    console.log(`Custom code v${version} is loaded!`);
  },
  false
);

// obversers dom changes
const startObserver = async () => {
  const observer = new MutationObserver((_mutations) => {
    const href = document.location.href;
    if (href.endsWith("/schema/key") || href.endsWith("/schema/value")) {
      // customizations for schema screens
      setMetadataVersion(href);
    } else if (href.endsWith("/schema/value/edit/definition")) {
      // TODO add customizations for validation/save here
      console.log(`I'm on the schema evolve screen now`);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
};
window.onload = startObserver;

// set the version asynronously after we add the element to the dom to not block anything
// calls the schema registry to get the metadata that is part of the schema
const setVersionOnElement = async (schemaName, version) => {
  const url = `${schemaRegistryAPIPath}/subjects/${schemaName}/versions/${version}`;
  // console.log("Fetching metadata information", url);
  const response = await fetch(url);
  const json = await response.json();
  const metadataVersion = json?.metadata?.properties?.version ?? "-";
  // console.log("Meta version is", metadataVersion);
  document.getElementById(schemaSemverVersionDivTag).textContent =
    metadataVersion;
};

// add the meta-version field where we want it to be in the dom
// not that this runs on all mutations
const setMetadataVersion = (href) => {
  const schemaSemverEl = document.getElementById(schemaSemverDivTag);
  // this check is important so we only add the element once, otherwise we create an infite loop of mutations
  if (schemaSemverEl == null) {
    // add the additional elements to the DOM
    appendMetadataVersionToDOM(href);
  } else if (schemaSemverEl.textContent !== "") {
    // refresh the version when we change screen again
    updateMetadataVersionOnChange(schemaSemverEl);
  }
};

function updateMetadataVersionOnChange(schemaSemverEl) {
  const newSchemaId = getSchemaId(getVersionDropdown().textContent);
  if (schemaSemverEl.dataset.schemaId !== newSchemaId) {
    schemaSemverEl.dataset.schemaId = newSchemaId;
    document.getElementById(schemaSemverVersionDivTag).textContent = "";
    // this should be done async
    setVersionOnElement(schemaSemverEl.dataset.schemaName, newSchemaId);
  }
}

function appendMetadataVersionToDOM(href) {
  // check the DOM structure to find the right selectors
  const versionRow = document.querySelector(
    "[class^=ContentPanel] > div > div > div:nth-child(2) > div"
  );
  const dropDownOption = getVersionDropdown();
  // add our new field once the selected elements were rendered on screen, i.e. they are not null
  if (versionRow != null && dropDownOption != null) {
    const schemaId = getSchemaId(dropDownOption.textContent);
    const schemaName = getSchemaName(href);
    const div = document.createElement("div");
    div.id = schemaSemverDivTag;
    div.dataset.schemaId = schemaId;
    div.dataset.schemaName = schemaName;
    const label = document.createElement("strong");
    label.textContent = schemaSemverVersionLabel;
    div.appendChild(label);
    const version = document.createElement("span");
    version.id = schemaSemverVersionDivTag;
    div.appendChild(version);
    versionRow.appendChild(div);

    // this should be done async
    setVersionOnElement(schemaName, schemaId);
  }
}

function getVersionDropdown() {
  return document.querySelector("[class^=DropdownOptions___StyledDiv2]");
}

// e.g. Version 1, Version 2 (Current)
function getSchemaId(versionDropdownText) {
  const schemaId = versionDropdownText.split(" ")[1];
  return schemaId;
}

// e.g. .../topics/topic_54/schema/value
function getSchemaName(href) {
  const hrefParts = href.split("/");
  const hrefPartsLen = hrefParts.length;
  const schemaName = `${hrefParts[hrefPartsLen - 3]}-${
    hrefParts[hrefPartsLen - 1]
  }`;
  return schemaName;
}
