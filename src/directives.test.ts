import { describe, expect, it } from "vitest";
import {
  findMiraDirectives,
  miraDirectiveNames,
  parseMystMarkdown,
  type MiraDirectiveName,
} from "./index.js";

describe("MIRA directives", () => {
  it("parses a directive into a typed MIRA mdast node", () => {
    const tree = parseMystMarkdown(`:::{claim} Treatment reduces risk
:label: claim-risk

The claim body can contain **nested MyST**.
:::
`);

    const [claim] = findMiraDirectives(tree);

    expect(claim).toMatchObject({
      type: "claim",
      kind: "mira",
      directive: "claim",
      title: "Treatment reduces risk",
      identifier: "claim-risk",
      label: "claim-risk",
      options: {
        label: "claim-risk",
      },
    });
    expect(claim.children[0]?.type).toBe("paragraph");
  });

  it.each(miraDirectiveNames)(
    "supports the %s directive",
    (name: MiraDirectiveName) => {
      const tree = parseMystMarkdown(`:::{${name}} ${name} title
Content for ${name}.
:::
`);

      const [node] = findMiraDirectives(tree);

      expect(node.type).toBe(name);
      expect(node.title).toBe(`${name} title`);
      expect(node.children).toHaveLength(1);
    },
  );

  it("parses a question directive", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{question} Does treatment X reduce cardiovascular risk?
:label: q-risk

Does treatment X significantly reduce cardiovascular risk in adults?
:::
`),
    );
    expect(node).toMatchObject({
      type: "question",
      kind: "mira",
      directive: "question",
      title: "Does treatment X reduce cardiovascular risk?",
      identifier: "q-risk",
      label: "q-risk",
    });
  });

  it("parses a claim directive with addresses option", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{claim} Treatment X reduces risk
:label: claim-risk
:addresses: q-risk

Treatment X significantly reduces cardiovascular risk in the target population.
:::
`),
    );
    expect(node).toMatchObject({
      type: "claim",
      kind: "mira",
      directive: "claim",
      title: "Treatment X reduces risk",
      identifier: "claim-risk",
      label: "claim-risk",
      addresses: ["q-risk"],
    });
  });

  it("parses a protocol directive", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{protocol} Standard Treatment Protocol
:label: protocol-standard

Administer treatment X at 10mg daily for 12 weeks.
:::
`),
    );
    expect(node).toMatchObject({
      type: "protocol",
      kind: "mira",
      directive: "protocol",
      title: "Standard Treatment Protocol",
      identifier: "protocol-standard",
      label: "protocol-standard",
    });
  });

  it("parses a study directive with produces option", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{study} RCT of Treatment X
:label: study-rct
:produces: evidence-rct

A randomized controlled trial of treatment X in 500 adults.
:::
`),
    );
    expect(node).toMatchObject({
      type: "study",
      kind: "mira",
      directive: "study",
      title: "RCT of Treatment X",
      identifier: "study-rct",
      label: "study-rct",
      produces: ["evidence-rct"],
    });
  });

  it("parses an evidence directive with supports and derived-from options", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{evidence} RCT results support the claim
:label: evidence-rct
:supports: claim-risk
:derived-from: study-rct

The RCT showed a 30% reduction in events (p < 0.01).
:::
`),
    );
    expect(node).toMatchObject({
      type: "evidence",
      kind: "mira",
      directive: "evidence",
      title: "RCT results support the claim",
      identifier: "evidence-rct",
      label: "evidence-rct",
      supports: ["claim-risk"],
      "derived-from": ["study-rct"],
    });
  });

  it("parses a follows-protocol directive with modified-by option", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{follows-protocol} Study follows standard protocol
:label: follows-standard
:modified-by: protocol-mod

The study followed the standard treatment protocol with minor modifications.
:::
`),
    );
    expect(node).toMatchObject({
      type: "follows-protocol",
      kind: "mira",
      directive: "follows-protocol",
      title: "Study follows standard protocol",
      identifier: "follows-standard",
      label: "follows-standard",
      "modified-by": ["protocol-mod"],
    });
  });

  it("parses a request directive", () => {
    const [node] = findMiraDirectives(
      parseMystMarkdown(`
:::{request} Request for additional evidence
:label: request-more

Additional RCT data from diverse populations is needed.
:::
`),
    );
    expect(node).toMatchObject({
      type: "request",
      kind: "mira",
      directive: "request",
      title: "Request for additional evidence",
      identifier: "request-more",
      label: "request-more",
    });
  });
});
