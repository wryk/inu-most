// @flow

import { start } from '../../'
import * as clock from './clock'

const { views } = start(clock)

views.observe(view => console.log(view))
