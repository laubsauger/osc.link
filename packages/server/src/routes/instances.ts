import { Router } from 'express';
import { Instance } from '../models';

const router = Router();

// Create a new instance
router.post('/', async (req, res) => {
  try {
    const instance = await Instance.create(req.body);
    res.status(201).json(instance);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Read all instances
router.get('/', async (req, res) => {
  try {
    const instances = await Instance.findAll();
    res.status(200).json(instances);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Read a single instance by ID
router.get('/:id', async (req, res) => {
  try {
    const instance = await Instance.findByPk(req.params.id);
    if (instance) {
      res.status(200).json(instance);
    } else {
      res.status(404).json({ error: 'Instance not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update an instance by ID
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Instance.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedInstance = await Instance.findByPk(req.params.id);
      res.status(200).json(updatedInstance);
    } else {
      res.status(404).json({ error: 'Instance not found' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete an instance by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Instance.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Instance not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;