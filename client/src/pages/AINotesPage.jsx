import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';

const AINotesPage = () => {
  const { notes, loading, error: notesError, addNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setError('Add a title and some note text before summarizing.');
      return;
    }

    setError('');
    setIsSummarizing(true);
    try {
      await addNote({ title: trimmedTitle, content: trimmedContent });
      setTitle('');
      setContent('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not summarize this note. Please check the server connection and try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Agent memory</span>
          <h2>Turn your notes into usable agent context</h2>
        </div>
      </div>
      <form className="glass-card form-card note-create-form" onSubmit={handleSubmit}>
        <h3>Add context for your agent</h3>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          aria-label="Note title"
          maxLength={120}
        />
        <textarea
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Paste your study notes here"
          aria-label="Study note content"
          maxLength={12000}
          rows={5}
        />
        <small>{content.length}/12,000 characters</small>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="gradient-button" type="submit" disabled={isSummarizing}>
          {isSummarizing ? 'Summarizing...' : 'Summarize and extract concepts'}
        </button>
      </form>
      <p className="graph-demo-note">
        The demo extracts from submitted text and the representative concept graph. A prerequisite absent from these notes is not evidence that you do not know it.
      </p>
      {loading ? <p role="status">Loading agent notes...</p> : notesError ? (
        <p className="form-error" role="alert">{notesError}</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <article key={note.id} className="glass-card note-card">
              <h3>{note.title}</h3>
              <section>
                <h4>Summary</h4>
                <p>{note.summary}</p>
              </section>
              <section>
                <h4>Extracted concepts</h4>
                <div className="concept-tags">
                  {(note.concepts || []).map((concept) => <span key={concept}>{concept}</span>)}
                  {!note.concepts?.length && <p>No known concepts were matched in the submitted text.</p>}
                </div>
              </section>
              {note.keyPoints?.length > 0 && (
                <section>
                  <h4>Key points</h4>
                  <ul className="note-analysis-list">
                    {note.keyPoints.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}
                  </ul>
                </section>
              )}
              {note.definitions?.length > 0 && (
                <section>
                  <h4>Definitions found</h4>
                  <dl className="note-definitions">
                    {note.definitions.map(({ term, definition }, index) => (
                      <div key={`${term}-${index}`}>
                        <dt>{term}</dt>
                        <dd>{definition}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {note.flashcards?.length > 0 && (
                <section>
                  <h4>Flashcards</h4>
                  <div className="note-analysis-list">
                    {note.flashcards.map((card, index) => (
                      <div className="note-flashcard" key={`${index}-${card.question}`}>
                        <strong>{card.question}</strong>
                        <p>{card.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {note.graphLinks?.nodes?.length > 0 && (
                <section>
                  <h4>Knowledge graph links</h4>
                  <div className="concept-tags">
                    {note.graphLinks.nodes.map((node) => <span key={node.id}>{node.name} · {node.subject}</span>)}
                  </div>
                  {note.graphLinks.edges?.length > 0 && (
                    <ul className="note-analysis-list">
                      {note.graphLinks.edges.map((edge, index) => (
                        <li key={`${edge.source}-${edge.target}-${index}`}>
                          {note.graphLinks.nodes.find((node) => node.id === edge.source)?.name} {edge.type.replaceAll('_', ' ').toLowerCase()} {note.graphLinks.nodes.find((node) => node.id === edge.target)?.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              {note.missingPrerequisites?.length > 0 && (
                <section>
                  <h4>Prerequisites not mentioned in these notes</h4>
                  <ul className="note-analysis-list">
                    {note.missingPrerequisites.map(({ concept, requiredBy }, index) => (
                      <li key={`${concept}-${requiredBy}-${index}`}>{concept} is linked as a prerequisite to {requiredBy} in the demo graph.</li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AINotesPage;
