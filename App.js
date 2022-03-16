Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    _storiesToEdit:null,
    _isoDate:null,
    launch: function() {
        var now = new Date();
        var date = Rally.util.DateTime.add(now, "day", -1);
        this._isoDate =  Rally.util.DateTime.toIsoString(date,true);
        var that = this;
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'hbox',
            items: [
                {
                    xtype: 'rallybutton',
                    id: 'delete-description-button',
                    text: 'Delete Description',
                    margin: 15,
                    handler: function() {
                        that._deleteDescription();
                    }
                }
            ]
        });
        this.add(panel);
        
        Ext.create('Rally.data.wsapi.Store', {
            model: 'User Story',
            fetch: ['FormattedID','Name','Description'],
            pageSize: 100,
            autoLoad: true,
            filters: [
                {
                    property: 'CreationDate',
                    operator: '>',
                    value: this._isoDate
                }
                ],
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        }); 
    },
    _onDataLoaded:function(store, data){
        var value = "FOUND " + data.length +  " STORIES CREATED BEFORE " +  this._isoDate + '<br />';
        _.each(data, function(record){
            value += '<a href="https://rally1.rallydev.com/#/detail/userstory/' + record.get('ObjectID') + '" target="_blank">' + record.get('FormattedID') + '</a><br/>';
        });
	this._storiesToEdit = data;
	var info = Ext.create('Ext.Component', {
            xtype: 'component',
            itemId: 'info',
            id: 'info',
            html: value,
            margin: 10
        });
        this.add(info);    
    },
    
    _deleteDescription:function(){
        console.log('deleting descriptions...');
        var that = this;
        var listOfUpdatedStories = 'updated:<br />';
        var listOfReadOnlyStories = 'did not update: <br />';
        var text = Ext.getCmp('info');
        text.update(listOfUpdatedStories);
        Rally.data.BulkRecordUpdater.updateRecords({
            records: this._storiesToEdit,
            propertiesToUpdate: {
                Description: ''
            },
            recordUpdate: function(record){
                listOfUpdatedStories += record.get('FormattedID') + '<br />';
                text.update(listOfUpdatedStories);
            },
             success: function(readOnlyRecords){
                if(readOnlyRecords.length > 0){
                    _.each(readOnlyRecords, function(record){
                        listOfReadOnlyStories += record.get('FormattedID') + '<br />';
                    });
                }
                listOfUpdatedStories += 'Done!';
                text.update(listOfUpdatedStories);
            },
            scope: this
        });
    }
});
