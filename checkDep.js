const fs = require('fs');

function readDependenciesFromJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function checkAndMergePackageDependencies(dependenciesJson, packageFilePath) {
    const packageJson = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));
    const dependenciesFromPackage = packageJson.dependencies;

    let matches = [];
    let mergedList = [];

    const nodeDependency = dependenciesJson.find(dep => dep.name === "Node");
    if (nodeDependency) {
        mergedList = mergedList.concat(nodeDependency.list || []);
    }

    dependenciesJson.forEach(dep => {
        if (dep.name !== "Node" && dependenciesFromPackage[dep.name] && (!dep.version || dep.version === dependenciesFromPackage[dep.name])) {
            matches.push(dep.name);
            mergedList = mergedList.concat(dep.list || []);
        }
    });

    return { matches, mergedList };
}

const packageFilePath = process.argv[2];
const dependenciesJson = readDependenciesFromJson('dependency.json');
const result = checkAndMergePackageDependencies(dependenciesJson, packageFilePath);

console.log('Detected dependency:', result.matches);

fs.writeFileSync('blocklist.json', JSON.stringify(result.mergedList, null, 2));
