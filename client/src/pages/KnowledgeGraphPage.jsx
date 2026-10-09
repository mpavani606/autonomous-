import { useKnowledgeGraph } from '../hooks/useKnowledgeGraph';

const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const KnowledgeGraphPage = () => {
  const { graph, loading, error } = useKnowledgeGraph();
  const concepts = graph.nodes.filter((node) => node.kind === 'concept' || !node.kind);
  const getConceptNames = (ids = []) => ids
    .map((id) => concepts.find((concept) => concept.conceptId === id || concept.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Agent context</span>
          <h2>Concept relationships and prerequisite map</h2>
        </div>
      </div>
      <p className="graph-demo-note">
        This map uses representative demo mastery, confidence, and review dates. It is agent context, not a live learner assessment.
      </p>
      <div className="glass-card form-card">
        {loading ? <p role="status">Loading knowledge graph...</p> : error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : concepts.length === 0 ? <p>No concepts are available in the knowledge graph.</p> : (
          <>
            <div className="graph-rail">
              {concepts.map((node) => (
                <article key={node.id} className="graph-card">
                  <div className="graph-card-heading">
                    <strong>{node.name}</strong>
                    <span className="pill">{node.difficulty}</span>
                  </div>
                  <small>{node.subject}</small>
                  <div className="graph-metrics">
                    <span>Mastery <strong>{node.masteryScore ?? node.mastery ?? 0}%</strong></span>
                    <span>Confidence <strong>{node.confidenceScore ?? 'Not recorded'}{node.confidenceScore != null ? '%' : ''}</strong></span>
                  </div>
                  <small>Prerequisites: {getConceptNames(node.prerequisites).join(', ') || 'None listed'}</small>
                  <small>Related: {getConceptNames(node.relatedConcepts).join(', ') || 'None listed'}</small>
                  <small>Last studied: {formatDate(node.lastStudied)}</small>
                  <small>Next revision: {formatDate(node.nextRevision)}</small>
                </article>
              ))}
            </div>
            <div className="graph-relationships" aria-label="Concept prerequisites and relationships">
              <h3>Concept relationships</h3>
              {graph.edges.map((edge, index) => {
                const source = graph.nodes.find((node) => node.id === edge.source);
                const target = graph.nodes.find((node) => node.id === edge.target);

                return source && target ? (
                  <div className="graph-relationship" key={`${edge.source}-${edge.target}-${index}`}>
                    <strong>{source.name}</strong>
                    <span>{edge.type.replaceAll('_', ' ').toLowerCase()}</span>
                    <strong>{target.name}</strong>
                  </div>
                ) : null;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
