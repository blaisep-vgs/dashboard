/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { Component } from 'react';
import {
  CheckmarkFilled16 as CheckmarkFilled,
  ChevronRight16 as ChevronRight,
  CloseFilled16 as CloseFilled
} from '@carbon/icons-react';
import { Spinner, Step } from '@tektoncd/dashboard-components';

import { updateUnexecutedSteps } from '@tektoncd/dashboard-utils';

import './Task.scss';

class Task extends Component {
  state = { selectedStepId: null };

  componentDidMount() {
    this.selectDefaultStep();
  }

  handleClick = event => {
    if (event) {
      event.preventDefault();
    }

    const { id } = this.props;
    const { selectedStepId } = this.state;
    this.props.onSelect(id, selectedStepId);
  };

  handleStepSelected = selectedStepId => {
    this.setState({ selectedStepId }, () => {
      this.handleClick();
    });
  };

  handleTaskSelected = event => {
    if (event) {
      event.preventDefault();
    }
    this.setState({ selectedStepId: null }, () => {
      this.handleClick();
    });
  };

  selectDefaultStep() {
    const { expanded, steps } = this.props;
    const { selectedStepId } = this.state;
    if (expanded && !selectedStepId) {
      const erroredStep = steps.find(
        step => step.reason === 'Error' || step.reason === undefined
      );
      const { id } = erroredStep || steps[0] || {};
      this.handleStepSelected(id);
    }
  }

  icon() {
    const { reason, succeeded } = this.props;

    if (succeeded === 'Unknown' && reason === 'Running') {
      return <Spinner className="task-icon" />;
    }

    let Icon = ChevronRight;
    if (succeeded === 'True') {
      Icon = CheckmarkFilled;
    } else if (succeeded === 'False') {
      Icon = CloseFilled;
    }

    return <Icon className="task-icon" />;
  }

  render() {
    const { expanded, reason, succeeded, steps, pipelineTaskName } = this.props;
    const { selectedStepId } = this.state;
    const icon = this.icon();
    return (
      <li
        className="task"
        data-succeeded={succeeded}
        data-reason={reason}
        data-selected={(expanded && !selectedStepId) || undefined}
      >
        <a
          className="task-link"
          href="#"
          title={pipelineTaskName}
          onClick={this.handleTaskSelected}
        >
          {icon}
          {pipelineTaskName}
        </a>
        {expanded && (
          <ol className="step-list">
            {updateUnexecutedSteps(steps).map(
              ({ id, reason: stepReason, status, stepName }) => {
                const selected = selectedStepId === id;
                const stepStatus =
                  reason === 'TaskRunCancelled' && status !== 'terminated'
                    ? 'cancelled'
                    : status;
                return (
                  <Step
                    id={id}
                    key={stepName}
                    onSelect={this.handleStepSelected}
                    reason={stepReason}
                    selected={selected}
                    status={stepStatus}
                    stepName={stepName}
                  />
                );
              }
            )}
          </ol>
        )}
      </li>
    );
  }
}

Task.defaultProps = {
  steps: []
};

export default Task;
