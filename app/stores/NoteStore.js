import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
    constructor() {
        this.bindActions(NoteActions);

        this.notes = [];
        this.exportPublicMethods({
            getNotesByIds: this.getNotesByIds.bind(this)
        });
    }
    getNotesByIds(ids) {
        // 1. Make sure we are operating on an array and
        // map over the ids
        // [id, id, id, ...] -> [[Note], [], [Note], ...]
        return (ids || []).map(
            // 2. Extract matching notes
            // [Note, Note, Note] -> [Note, ...] (match) or [] (no match)
            id => this.notes.filter(note => note.id === id)
            // 3. Filter out possible empty arrays and get notes
            // [[Note], [], [Note]] -> [[Note], [Note]] -> [Note, Note]
        ).filter(a => a.length).map(a => a[0]);
    }
    create(note) {
        const notes = this.notes;

        note.id = uuid.v4();

        this.setState({
            notes: [...notes, note]
        });
        return note;
    }
    update(updatedNote) {
        const notes = this.notes.map(note => {
            if (note.id === updatedNote.id) {
                // Example: {}, {a: 5, b: 3}, {a: 17} -> {a: 17, b: 3}
                return Object.assign({}, note, updatedNote);
            }

            return note;
        });

        // This is same as `this.setState({notes: notes})`
        this.setState({ notes });
    }
    delete(id) {
        this.setState({
            notes: this.notes.filter(note => note.id !== id)
        });
    }
}

export default alt.createStore(NoteStore, 'NoteStore');
