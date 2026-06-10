import { DirectiveData, DirectiveSpec }  from 'myst-common';
import type { GenericNode } from 'myst-common';
import {  miraDirectiveNames, type MiraDirectiveName, type MiraDirectiveNode, type MiraOptionValue } from './directives.types.js';

const commonOptionDefinitions: NonNullable<DirectiveSpec['options']> = {
  id: {
    type: String,
    doc: 'Stable identifier for this MIRA directive.',
  },
  label: {
    type: String,
    doc: 'Human-readable label or cross-reference target.',
  },
  name: {
    type: String,
    doc: 'Alias for a stable directive identifier.',
  },
  title: {
    type: String,
    doc: 'Display title. Overrides the directive argument when present.',
  },
};

type RelationshipField = 'addresses' | 'supports' | 'derived-from' | 'produces' | 'modified-by';

const directiveRelationshipFields: Partial<Record<MiraDirectiveName, RelationshipField[]>> = {
  claim: ['addresses'],
  evidence: ['supports', 'derived-from'],
  study: ['produces'],
  'follows-protocol': ['modified-by'],
};

const relationshipOptionDefinitions: Record<RelationshipField, NonNullable<DirectiveSpec['options']>[string]> = {
  addresses: { type: String, doc: 'Comma-separated identifiers of questions this claim addresses.' },
  supports: { type: String, doc: 'Comma-separated identifiers of claims this evidence supports.' },
  'derived-from': { type: String, doc: 'Comma-separated identifiers of studies this evidence was derived from.' },
  produces: { type: String, doc: 'Comma-separated identifiers of evidence this study produces.' },
  'modified-by': { type: String, doc: 'Comma-separated identifiers of modifications to the protocol.' },
};

function toStringArray(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined;
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function toOptions(options: DirectiveData['options']): Record<string, MiraOptionValue> {
  if (!options) return {};

  return Object.fromEntries(
    Object.entries(options).filter((entry): entry is [string, MiraOptionValue] => {
      const [, value] = entry;
      return value !== undefined && value !== null;
    }),
  );
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function bodyChildren(body: DirectiveData['body']): GenericNode[] {
  return Array.isArray(body) ? body : [];
}

function createMiraDirective(name: MiraDirectiveName): DirectiveSpec {
  const relationshipFields = directiveRelationshipFields[name] ?? [];
  const extraOptions = Object.fromEntries(
    relationshipFields.map((field) => [field, relationshipOptionDefinitions[field]]),
  );

  return {
    name,
    doc: `Structured MIRA ${name} directive.`,
    arg: {
      type: String,
      doc: 'Optional title for this directive.',
    },
    body: {
      type: 'myst',
      doc: 'Nested MyST Markdown content.',
    },
    options: { ...commonOptionDefinitions, ...extraOptions },
    run(data) {
      const options = toOptions(data.options);
      const title = stringValue(options.title) ?? stringValue(data.arg);
      const identifier =
        stringValue(options.id) ?? stringValue(options.label) ?? stringValue(options.name);

      const node: MiraDirectiveNode = {
        type: name,
        kind: 'mira',
        directive: name,
        options,
        children: bodyChildren(data.body),
      };

      if (title) node.title = title;
      if (identifier) {
        node.identifier = identifier;
        node.label = identifier;
      }

      for (const field of relationshipFields) {
        const value = toStringArray(options[field]);
        if (value) (node as Record<string, unknown>)[field] = value;
      }

      return [node];
    },
  };
}

export const miraDirectives: DirectiveSpec[] = miraDirectiveNames.map(createMiraDirective);

export function isMiraDirectiveNode(node: GenericNode): node is MiraDirectiveNode {
  return miraDirectiveNames.includes(node.type as MiraDirectiveName);
}
