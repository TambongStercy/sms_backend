import { Router } from 'express';
import * as ctrl from '../controllers/chatController';
import { authenticate } from '../middleware/auth.middleware';
import { chatUpload } from '../../../utils/fileUpload';

const router = Router();

router.use(authenticate);

// Contact search + presence (must be BEFORE dynamic channel :id routes)
router.get('/contacts', ctrl.searchContacts);
router.get('/presence', ctrl.getPresence);

// File upload for attachments (images, voice notes, docs)
router.post('/upload', chatUpload.single('file'), ctrl.uploadChatAttachment);

// Channels
router.get('/channels', ctrl.listMyChannels);
router.post('/channels', ctrl.createCustomChannel);
router.get('/channels/:id', ctrl.getChannel);
router.get('/channels/:id/messages', ctrl.listMessages);
router.post('/channels/:id/messages', ctrl.postMessage);
router.post('/channels/:id/read', ctrl.markRead);
router.post('/channels/:id/members', ctrl.addMember);
router.delete('/channels/:id/members/:userId', ctrl.removeMember);

// Messages
router.patch('/messages/:id', ctrl.editMessage);
router.delete('/messages/:id', ctrl.deleteMessage);
router.post('/messages/:id/reactions', ctrl.addReaction);
router.delete('/messages/:id/reactions/:emoji', ctrl.removeReaction);

// Direct messages
router.post('/dm', ctrl.openDirectMessage);

export default router;
