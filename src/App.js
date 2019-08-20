import React, { Component } from "react";
import Amplify, { graphqlOperation } from "aws-amplify";
import { withAuthenticator, Connect } from "aws-amplify-react";

import "./App.css";

import awsConfig from "./aws-exports";
import * as mutations from "./graphql/mutations";
import * as queries from "./graphql/queries";
import * as subscriptions from "./graphql/subscriptions";

Amplify.configure(awsConfig);

const ListView = ({ todos }) => (
  <div>
    <h2>All Tasks</h2>
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
        {todo.status == "Complete" ? <a href={'https://edatalandsheet.s3-us-west-2.amazonaws.com/'+todo.id+'.csv'} target="_blank">Download  </a> : ""}
        {todo.status} : {todo.name} : {todo.createdAt} : {todo.description}
        </li>
      ))}
    </ul>
  </div>
);

class AddTodo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: ""
    };
  }

  handleChange(name, ev) {
    this.setState({ [name]: ev.target.value });
  }

  async submit() {
    const { onCreate } = this.props;
    var input = {
      name: this.state.name,
      description: this.state.description
    };

    this.setState({ name: "", description: "" });
    await onCreate({ input });
  }

  render() {
    return (
      <div>
      <label for="input1">Note</label>
        <input
          id="input1"
          name="name"
          placeholder="Bracelet"
          onChange={ev => {
            this.handleChange("name", ev);
          }}
          style={{
            padding: "8px 16px",
            margin: "5px"
          }}
        />
      <label for="input2">Link URL</label>
        <input
          id="input2"
          name="description"
          placeholder="amazon.com search page1"
          onChange={ev => {
            this.handleChange("description", ev);
          }}
          style={{
            padding: "8px 16px",
            margin: "5px"
          }}
        />
        <button
          style={{
            padding: "8px 16px",
            margin: "5px"
          }}
          onClick={this.submit.bind(this)}
        >
          Add
        </button>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <h2>Add Task</h2>
        <Connect mutation={graphqlOperation(mutations.createTodo)}>
          {({ mutation }) => <AddTodo onCreate={mutation} />}
        </Connect>

        <Connect
          query={graphqlOperation(queries.listTodos)}
          subscription={graphqlOperation(subscriptions.onCreateTodo)}
          onSubscriptionMsg={(prev, { onCreateTodo }) => {
            return {
              listTodos: {
                items: [...prev.listTodos.items, onCreateTodo]
              }
            };
          }}
        >
          {({ data: { listTodos }, loading, error }) => {
            if (error) return <h3>Error</h3>;
            if (loading || !listTodos) return <h3>Loading...</h3>;
            return listTodos.items.length ? (
              <ListView todos={listTodos ? listTodos.items : []} />
            ) : (
              <h3>No todos yet...</h3>
            );
          }}
        </Connect>
      </div>
    );
  }
}

export default withAuthenticator(App, true);
