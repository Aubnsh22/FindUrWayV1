"""
NLP Service — Handles embedding generation and semantic similarity.
Uses Sentence Transformers (all-MiniLM-L6-v2) for lightweight, fast embeddings.
"""
import numpy as np
from typing import List, Optional
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

# Global model reference (loaded once at startup)
_model = None


def load_model(model_name: str = "all-MiniLM-L6-v2"):
    """
    Load the Sentence Transformer model into memory.
    Called once during application startup via lifespan.
    """
    global _model
    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading NLP model: {model_name}...")
        _model = SentenceTransformer(model_name)
        logger.info("NLP model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load NLP model: {e}")
        _model = None


def get_model():
    """Get the loaded model instance."""
    return _model


def generate_embedding(text: str) -> Optional[np.ndarray]:
    """
    Generate a dense vector embedding for the given text.
    Returns a numpy array of shape (384,) for MiniLM.
    """
    if _model is None:
        logger.warning("NLP model not loaded, returning None")
        return None
    try:
        # Truncate very long text to avoid issues
        text = text[:2000]
        embedding = _model.encode(text, convert_to_numpy=True)
        return embedding
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return None


def generate_embeddings_batch(texts: List[str]) -> Optional[np.ndarray]:
    """
    Generate embeddings for a batch of texts efficiently.
    Returns array of shape (n_texts, 384).
    """
    if _model is None:
        return None
    try:
        truncated = [t[:2000] for t in texts]
        embeddings = _model.encode(truncated, convert_to_numpy=True, batch_size=32)
        return embeddings
    except Exception as e:
        logger.error(f"Batch embedding generation failed: {e}")
        return None


def compute_similarity(embedding_a: np.ndarray, embedding_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two embeddings.
    Returns a float between 0 and 1.
    """
    try:
        sim = cosine_similarity(
            embedding_a.reshape(1, -1),
            embedding_b.reshape(1, -1)
        )[0][0]
        return float(max(0, min(1, sim)))  # Clamp to [0, 1]
    except Exception as e:
        logger.error(f"Similarity computation failed: {e}")
        return 0.0


def compute_similarity_batch(
    profile_embedding: np.ndarray,
    job_embeddings: np.ndarray
) -> List[float]:
    """
    Compute cosine similarity between a profile and multiple job embeddings.
    Returns list of similarity scores.
    """
    try:
        similarities = cosine_similarity(
            profile_embedding.reshape(1, -1),
            job_embeddings
        )[0]
        return [float(max(0, min(1, s))) for s in similarities]
    except Exception as e:
        logger.error(f"Batch similarity computation failed: {e}")
        return [0.0] * len(job_embeddings)
