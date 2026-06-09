import type { DirectiveData, DirectiveSpec, GenericNode, GenericParent } from 'myst-common';

export const miraDirectiveNames = [
  'question',
  'claim',
  'evidence',
  'study',
  'request',
  'protocol',
] as const;

export type MiraDirectiveName = (typeof miraDirectiveNames)[number];

export type MiraOptionValue = string | number | boolean | GenericNode[];

export interface MiraDirectiveNode extends Omit<GenericParent, 'type' | 'kind' | 'children'> {
  type: MiraDirectiveName;
  kind: 'mira';
  directive: MiraDirectiveName;
  title?: string;
  identifier?: string;
  label?: string;
  options: Record<string, MiraOptionValue>;
  children: GenericNode[];
}

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
  status: {
    type: String,
    doc: 'Workflow status for this item.',
  },
  tags: {
    type: String,
    doc: 'Comma-separated tags.',
  },
  ref: {
    type: String,
    doc: 'External or internal reference.',
  },
  doi: {
    type: String,
    doc: 'DOI reference.',
  },
  url: {
    type: String,
    doc: 'Source URL.',
  },
  source: {
    type: String,
    doc: 'Source description or identifier.',
  },
  priority: {
    type: String,
    doc: 'Priority or importance marker.',
  },
};

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
    options: commonOptionDefinitions,
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

      return [node];
    },
  };
}

export const miraDirectives: DirectiveSpec[] = miraDirectiveNames.map(createMiraDirective);

export function isMiraDirectiveNode(node: GenericNode): node is MiraDirectiveNode {
  return miraDirectiveNames.includes(node.type as MiraDirectiveName);
}
