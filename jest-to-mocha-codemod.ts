import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const getMatchingClosingCurlyBracketIndex = ({
  str,
  startingCurlyBracketIndex,
}: {
  str: string;
  startingCurlyBracketIndex: number;
}) => {
  if (startingCurlyBracketIndex === str.length - 1)
    throw new Error(`Index ${startingCurlyBracketIndex} is the last`);

  if (str[startingCurlyBracketIndex] !== "{")
    throw new Error(
      `No starting curly bracket at index ${startingCurlyBracketIndex}`
    );

  let otherStartingCurlyBracketsCount = 0;

  for (let i = startingCurlyBracketIndex + 1; i < str.length; ++i) {
    const char = str[i];
    if (char === "{") otherStartingCurlyBracketsCount++;
    else if (char === "}") {
      if (otherStartingCurlyBracketsCount > 0)
        otherStartingCurlyBracketsCount--;
      else return i;
    }
  }

  return -1;
};

const srcDir = join(__dirname, "electron/services");
const filePaths = readdirSync(srcDir)
  .filter((str) => str.endsWith(".test.ts"))
  .map((str) => join(srcDir, str))
  .filter((_, i) => i === 0);

// interface FancyLine {
//   indexAtStart: number;
//   line: string;
// }

interface MethodTestSuites {
  [methodName: string]: {
    description: string;
    content: string;
  }[];
}

interface ClassTestSuite {
  className: string;
  methods: MethodTestSuites;
}

const isValidArrayIndex = (index: number) => index >= 0;

for (const filePath of filePaths) {
  const oldContent = readFileSync(filePath).toString();
  const rawLines = oldContent.split("\n");

  const headers: string[] = [];

  const classTestSuite: ClassTestSuite = {
    className: "",
    methods: {},
  };

  let indexAtStartOfLine = 0;
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    if (line.startsWith("test(")) {
      const stringStarter = line.charAt("test('".length);

      const className = line.substring("test('".length, line.indexOf("#"));
      const methodSearchStartIndex = `test("${className}#`.length;
      const methodName = line.substring(
        methodSearchStartIndex,
        Math.min(
          ...[
            line.indexOf(" ", methodSearchStartIndex),
            line.indexOf(stringStarter, methodSearchStartIndex),
          ].filter(isValidArrayIndex)
        )
      );

      console.log(methodName);

      const testDescription = oldContent.substring(
        indexAtStartOfLine + `test("${className}#${methodName}`.length,
        indexAtStartOfLine + line.indexOf(stringStarter) + 2
        // + 2 to account for the fact that both are indices
        // (both are zero-based)
      );

      classTestSuite.className = className;
      classTestSuite.methods[methodName] =
        classTestSuite.methods[methodName] || [];

      const startIndex = oldContent.indexOf("{", indexAtStartOfLine);
      const endIndex = getMatchingClosingCurlyBracketIndex({
        str: oldContent,
        startingCurlyBracketIndex: startIndex,
      });

      // let indexOfLineAtEndIndex = startIndex;

      for (let j = i; j < rawLines.length; ++j) {
        indexAtStartOfLine += rawLines[j].length;
        if (indexAtStartOfLine > endIndex) {
          indexAtStartOfLine = endIndex + 3;
          // indexOfLineAtEndIndex = j;
          i = j;
          break;
        }
      }

      const testContent = oldContent.substring(startIndex, endIndex);
      classTestSuite.methods[methodName].push({
        content: testContent,
        description: testDescription,
      });
    } else {
      line.startsWith("import") && headers.push(line);
      indexAtStartOfLine += line.length;
    }
  }

  writeFileSync(
    filePath,
    `${headers.join("\n")}

  describe("${classTestSuite.className}", function () {
    ${Object.entries(classTestSuite.methods)
      .map(([methodName, methodSuites]) => {
        return `describe("#${methodName}", function () {
        ${methodSuites
          .map(
            ({ description, content }) =>
              `it("${description}", function () {
          ${content}
        });`
          )
          .join("\n")}
      });`;
      })
      .join("\n")}
  });
      `
  );

  console.log(`updated ${filePath}`);
}
