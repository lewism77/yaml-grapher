const { generateMermaidFormat } = require('../../src/generateMermaidFormat')

let expect;

describe("generateMermaidFormat tests", () => {
    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    it("should format basic non connected nodes", () => {
        // Arrange
        const nodes = [{ name: "main-pipeline.yml", id: 1 }, { name: "child-pipeline.yml", id: 2 }];
        const links = [];

        // Act
        let result = generateMermaidFormat({ nodes, links })

        // Assert
        expect(result).to.be.equal(`flowchart TD
    1["main-pipeline.yml"]
    2["child-pipeline.yml"]
`
        )
    });

    it("should format a basic source and target link", () => {
        // Arrange
        const nodes = [{ name: "main-pipeline.yml", id: 1 }, { name: "child-pipeline.yml", id: 2 }];
        const links = [{ source: nodes[0], target: nodes[1] }];

        // Act
        let result = generateMermaidFormat({ nodes, links })

        // Assert
        expect(result).to.be.equal(`flowchart TD
    1["main-pipeline.yml"]
    2["child-pipeline.yml"]
    1 --> 2
`
        )
    });

    it("should format conditional links", () => {
        // Arrange
        const nodes = [{ name: "main-pipeline.yml", id: 1 }, { name: "child-pipeline.yml", id: 2 }, { name: "cond-pipeline.yml", id: 3 }];
        const links = [{ source: nodes[0], target: nodes[1] }, { source: nodes[0], target: nodes[2], condition: "${{ if eq(param.do, true) }}" }];

        // Act
        let result = generateMermaidFormat({ nodes, links })

        // Assert
        expect(result).to.be.equal(`flowchart TD
    1["main-pipeline.yml"]
    2["child-pipeline.yml"]
    3["cond-pipeline.yml"]
    1 --> 2
    1 -->|"if eq(param.do, true)"| 3
`
        )
    });
});