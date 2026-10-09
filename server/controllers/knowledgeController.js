const { knowledgeGraph } = require('../utils/demoData');

const getKnowledgeGraph = async (req, res) => {
  res.json({ success: true, data: knowledgeGraph });
};

const getConcepts = async (req, res) => {
  res.json({
    success: true,
    data: knowledgeGraph.nodes
      .filter((node) => node.kind === 'concept')
      .map((node) => ({
        id: node.id,
        conceptId: node.conceptId,
        name: node.name,
        subject: node.subject,
        difficulty: node.difficulty,
        prerequisites: node.prerequisites,
        relatedConcepts: node.relatedConcepts,
        masteryScore: node.masteryScore,
        confidenceScore: node.confidenceScore,
        lastStudied: node.lastStudied,
        nextRevision: node.nextRevision,
      })),
  });
};

module.exports = { getKnowledgeGraph, getConcepts };
