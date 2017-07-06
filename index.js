// @flow

import { async, Subject } from 'most-subject'
import equal from 'fast-deep-equal'
import type { Stream } from '@most/types'

export type Application<Model, Effect, Action, View> = {
	actions: Stream<Action>,
	states: Stream<State<Model, Action>>,
	models: Stream<Model>,
	effects: Stream<Effect>,
	views: Stream<View>
}

export type Program<Model, Effect, Action, View> = {
	init: () => State<Model, Effect>,
	update: (Model, Action) => State<Model, Effect>,
	view: (Model, (Action) => void) => ?View,
	run: (Effect) => ?Stream<Action>
}

export type State<Model, Effect> = {
	model: Model,
	effect?: Effect
}

export type {
	Stream
}

const notNull: (any) => boolean = x => x != null

export function start<Model, Effect, Action, View> (program: Program<Model, Effect, Action, View>): Application<Model, Effect, Action, View> {
	const { init, update, view, run } = program

	const actions: Subject<Action> = async()
	const states: Subject<State<Model, Effect>> = async()
	const models: Subject<Model> = async()
	const views: Subject<View> = async()
	const effects: Subject<Effect> = async()

	const initialState: State<Model, Effect> = init()

	// get states from actions with first initial state
	actions
		.scan((state, action) => update(state.model, action), initialState)
		.observe(action => states.next(action))

	// get models from states
	states
		.map(state => state.model)
		.skipRepeatsWith(equal)
		.observe(model => models.next(model))

	// get views from models, allow views to dispatch actions
	models
		.map(model => view(model, dispatch))
		.filter(notNull)
		.observe(view => views.next(view))

	// get actions from views
	function dispatch (action) {
		actions.next(action)
	}

	// get effects from states
	states
		.map(state => state.effect)
		.filter(notNull)
		.observe(effect => effects.next(effect))

	// get actions from effects
	effects
		.map(effect => run(effect))
		.filter(notNull)
		.observe(actionStream => actionStream.observe(action => actions.next(action)))

	return {
		actions,
		states,
		models,
		effects,
		views
	}
}
