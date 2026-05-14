type StructuredDataValue = Record<string, unknown> | Record<string, unknown>[];

function serialize(data: StructuredDataValue) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function StructuredData({ data }: { data: StructuredDataValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
      type="application/ld+json"
    />
  );
}
