/** @jsx React.DOM */
RecordRow = React.createClass({
  makeEditable: function (e) {
    if (this.props.model.get('editing')) {
      return;
    }
    this.props.model.set({
      editing: true,
    });

    this.refs.value.getDOMNode().value = this.props.model.get('q');
  },

  escape: function(e) {
    if (e.which == 27) {
      this.props.model.set({
        editing: false,
      });
      return;
    }
  },

  updateValue: function(e) {
    if (e.keyCode != 13) return;
    if (!this.refs.value.getDOMNode().value) return;

    this.props.model.set({
      q: parseInt(this.refs.value.getDOMNode().value, 10),
      editing: false,
    });
    readings.sync("update", this.props.model);
  },

  render: function() {
    var cx = React.addons.classSet;
    var span_classes = cx({
      'value': true,
      'active': !this.props.model.get('editing'),
      'inactive': this.props.model.get('editing'),
    });
    var input_classes = cx({
      'value': true,
      'form-control': true,
      'active': this.props.model.get('editing'),
      'inactive': !this.props.model.get('editing'),
    });
    return (
      <tr>
        <td>{this.props.model.date()}</td>
        <td >
          <span className={span_classes} onDoubleClick={this.makeEditable}>
            {this.props.model.get('q')}
          </span>
          <input className={input_classes} type="text" onKeyPress={this.updateValue} onKeyUp={this.escape} ref="value" />
        </td>
        <td>{this.props.model.formatCost()}</td>
      </tr>
      );
  }
});

RecordsView = React.createClass({
  componentDidMount: function() {
    this.props.collection.on('all', function() {
      this.forceUpdate();
    }.bind(this));
  },

  addValue: function (e) {
    if (e.keyCode != 13) return;
    if (!this.refs.newValue.getDOMNode().value) return;

    readings.create({
      q: this.refs.newValue.getDOMNode().value,
    });

    this.refs.newValue.getDOMNode().value = '';
  },

  addReading: function(e) {
    if (e.keyCode != 13) return;
    if (!this.refs.newReading.getDOMNode().value) return;

    readings.create({
      q: parseInt(this.refs.newReading.getDOMNode().value, 10) - readings.lastReading,
    });

    this.refs.newReading.getDOMNode().value = '';
  },

  showOlder: function(e) {
    readings.trigger("offset", readings.offset + 1);
    e.preventDefault();
  },

  showNewer: function(e) {
    readings.trigger("offset", readings.offset - 1);
    e.preventDefault();
  },

  render: function() {
    records = _(this.props.collection.initial(readings.offset)).last(12);
    var rowNodes = _(records).map(function (item) {
      return <RecordRow model={item} />;
    });
    if (rowNodes.length < 12) {
      _(12 - rowNodes.length).times(function() {
        rowNodes.push(<tr className="blank"><td>-</td><td>0</td><td>0</td></tr>);
      }, this);
    }

    var cx = React.addons.classSet;
    var next_classes = cx({
      'next': true,
      'disabled': readings.offset === 0,
    });
    var previous_classes = cx({
      'previous': true,
      'disabled': readings.offset === readings.length - 12 || readings.length <= 12
    });

    return (
      <div>
        <div className="row">
          <div className="col-xs-5">
            <div className="input-group">
              <input className="form-control" ref="newValue" placeholder="Enter new data" type="text" onKeyPress={this.addValue} />
              <span className="input-group-addon">kW</span>
            </div>
          </div>
          <div className="col-xs-2 middle-word">Or</div>
          <div className="col-xs-5">
            <input className="form-control" ref="newReading" placeholder="Enter new reading" type="text" onKeyPress={this.addReading} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <table className="table table-hover table-bordered table-striped">
              <thead>
                <tr>
                  <th>Date</th><th>Consumption</th><th>Cost</th>
                </tr>
              </thead>
              <tbody>{rowNodes}</tbody>
            </table>
            <ul className="pager">
              <li className={previous_classes}>
                <a href="#older-records" id="older" onClick={this.showOlder}>&larr; Older</a>
              </li>
              <li className={next_classes}>
                <a href="#newer-records" id="newer" onClick={this.showNewer}>Newer &rarr;</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

React.renderComponent(
  <RecordsView collection={readings} />,
  $('div#data-view').get(0),
  true
);
