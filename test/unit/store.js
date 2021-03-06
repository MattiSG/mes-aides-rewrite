import expect from 'expect.js';

import {
    createOpenfiscaSituationUpdateAction,
    createAsyncStartAction,
    createAsyncEndAction,
    ERROR,
    UPDATE_OPENFISCA_SITUATION,
    ASYNC_ACTION_START,
    ASYNC_ACTION_END,
} from '../../front/actions.js';
import {
    INITIAL_STATE,
    reducer,
    storageMiddleware,
} from '../../front/store.js';


describe('reducer', () => {
    const OPENFISCA_RESPONSE = require('../mock/openfisca-response.json');

    describe('initial state', () => {
        it('should be returned by default', () => {
            expect(reducer()).to.eql(INITIAL_STATE);
        });
    });

    describe('createOpenfiscaSituationUpdateAction', () => {
        function update() {
            return reducer(INITIAL_STATE, createOpenfiscaSituationUpdateAction({
                "individus": [
                    {
                        "salaire_net": {
                            "2013": 50000,
                        },
                    },
                ],
            }));
        }

        it('should return an updated state', () => {
            let actual = update();

            expect(actual.openfiscaSituation.individus[0].salaire_net['2013']).to.equal(50000);
        });

        it('should keep previous state intact', () => {
            let actual = update();

            expect(INITIAL_STATE.openfiscaSituation.individus[0].salaire_net['2013']).to.equal(40000);
        });
    });

    describe('async actions', () => {
        describe('init', () => {
            it('should have a falsy `async` property', () => {
                expect(reducer().async).to.not.be.ok();
            });
        });

        describe('start', () => {
            it('should set the `async` property to truthy', () => {
                expect(reducer(INITIAL_STATE, createAsyncStartAction()).async).to.be.ok();
            });
        });

        describe('stop', () => {
            it('should set the `async` property to falsy', () => {
                expect(reducer(INITIAL_STATE, createAsyncEndAction()).async).to.not.be.ok();
            });
        });
    });

    describe('storageMiddleware', () => {
        let storage = { // mock
                setItemCallCount: 0,
                getItemCallCount: 0,
                getItem() { storage.getItemCallCount++ },
                setItem() { storage.setItemCallCount++ },
            },
            reducer = (state, action) => state,
            subject = storageMiddleware(reducer, storage);

        it('should return the reducer’s result', () => {
            let state = { test: true };
            expect(subject(state, { type: ERROR })).to.eql(state);
        });

        it('should not store on error', () => {
            subject({}, { type: ERROR });
            expect(storage.setItemCallCount).to.be(0);
        });

        it('should store on situation update', () => {
            subject({}, { type: UPDATE_OPENFISCA_SITUATION });
            expect(storage.setItemCallCount).to.be(1);
        });

        it('should load only on default state lookup', () => {
            expect(storage.getItemCallCount).to.be(0);
            subject(undefined, {});
            expect(storage.getItemCallCount).to.be(1);
        });
    });
});
