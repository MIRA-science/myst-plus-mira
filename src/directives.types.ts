import type { GenericNode, GenericParent } from "myst-common";

export const miraDirectiveNames = [
  "question",
  "claim",
  "evidence",
  "study",
  "request",
  "protocol",
  "follows-protocol",
] as const;

export type MiraDirectiveName = (typeof miraDirectiveNames)[number];

export type MiraOptionValue = string | number | boolean | GenericNode[];

export interface MiraDirectiveNode extends Omit<
  GenericParent,
  "type" | "kind" | "children"
> {
  type: MiraDirectiveName;
  kind: "mira";
  directive: MiraDirectiveName;
  title?: string;
  identifier?: string;
  label?: string;
  options: Record<string, MiraOptionValue>;
  children: GenericNode[];
}

export interface MiraDirectiveClaim extends MiraDirectiveNode {
  type: "claim";
  directive: "claim";
  addresses?: string[];
}

export interface MiraDirectiveEvidence extends MiraDirectiveNode {
  type: "evidence";
  directive: "evidence";
  supports?: string[];
  "derived-from"?: string[];
}

export interface MiraDirectiveStudy extends MiraDirectiveNode {
  type: "study";
  directive: "study";
  produces?: string[];
}

export interface MiraDirectiveFollowsProtocol extends MiraDirectiveNode {
  type: "follows-protocol";
  directive: "follows-protocol";
  "modified-by"?: string[];
}
