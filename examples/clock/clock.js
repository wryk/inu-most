// @flow

import type { State, Stream } from '../../'
import { just } from 'most'

type Model = number
type Action = 'TICK'
type Effect = 'SCHEDULE_TICK'
type View = string

export const init = (): State<Model, Effect> => ({
	model: 0,
	effect: 'SCHEDULE_TICK'
})

export const update = (model: Model, action: Action): State<Model, Effect> => {
	switch (action) {
		default:
			throw new Error()

		case 'TICK':
			return {
				model: model === 59 ? 0 : model + 1,
				effect: 'SCHEDULE_TICK'
			}
	}
}

export const run = (effect: Effect): Stream<Action> => {
	switch (effect) {
		default:
			throw new Error()

		case 'SCHEDULE_TICK':
			return just('TICK').delay(1000)
	}
}

export const view = (model: Model, dispatch: (Action) => void): View => {
	return `${model}`
}
