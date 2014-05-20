# mongoose-merge-plugin

Mongoose plugin for document merging

## Install npm install mongoose-merge-plugin

## Loading

  var merge = require('mongoose-merge-plugin');

## Inintialization

  var mongoose = require('mongoose');
  
  mongoose.plugin(merge);

## Usage

The method <i>merge</i> is added to all mongoose documents. It takes a source object as parameter and merge it in the target existing documents. It checks for existing values in the source object regarding the field path of the destination document.
It does not merge the <i>\_id</i> and <i>\_\_v</i> default fields and check for the schema field option <i>mergeable</i>. If the option is false, the merge skip the field as well.

It also checks the path options of the schema for the <i>mergeidentifier</i> and <i>mergeoverride</i> options, which are used to merge arrays of subschemas.

* <b>mergeidentifier</b>

> Default: _id  
> The field, which is used to find the subitem to update.

* <b>mergeoverride</b>

> Default: true  
> If set to false, it will not replace the whole array, but iterate through it and merge subdocuments found by the <i>mergeidentifier</i> with the new value or if not found append it to the array.



The method <i>merge</i> accept a second parameter that is the merge options. this parameter allow to specify a filter on fields when calling the merge.

* <b>options.fields</b>

> It is a string with field names, separeted by one or more spaces. If the field path is present in this string, the merge check if the mongoose field is mergeable and if yes it allows the merge. If before the field path a + flag is added, then the field will be merged (overriding the schema field option). If the flag is '-' the field will not be merged as well as if the field name is not present.

* <b>options.virtuals</b>

> It is a boolean value that activates the merging of the virtuals fields

## Example

<pre>
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  description: String,
  notMergedField: { type: String, mergeable: false }
});
var Test = mongoose.model('Test', schema);
var test = new Test({ name: "test", description: "desc", notMergedField: "testNMF" });
console.log(test); // LOG: { i_id: ..., name: test, description: desc, notMergedField: testNMF ...}
test.merge({ name: "testChanged", description: "descChanged", notMergedField: "testNMFChanged" });
console.log(test); // LOG: { i_id: ..., name: testChanged, description: descChanged, notMergedField: testNMF ...}
test.merge({ name: "test", description: "desc" }, { fields: "-description" });
console.log(test); // LOG: { i_id: ..., name: test, description: descChanged, notMergedField: testNMF ...}
</pre>

### Deep Merge
<pre>
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    merge = require('mongoose-merge-plugin');

mongoose.plugin(merge);
var subSchema = new Schema({
    name: String,
    keywords: { type: [String], mergeoverride: false }
});

var majorSchema = new Schema({
    subs: {type: [subSchema], mergeoverride: false, mergeidentifier: 'name'},
    title: String
});

var TestModel = mongoose.model('TestModel', majorSchema);
var major = new TestModel({
    title: 'My Major',
    subs: [
        {
            name: 'Sub No 1',
            keywords: ['Key']
        },
        {
            name: 'One Time Sub',
            keywords: ['newest']
        }
    ]
});

console.log(major.title);
console.log(major.subs);

major.merge({
    subs: [
        {
            name: 'Sub No 1',
            keywords: ['Words']
        },
        {
            name: 'Newer Sub'
        }
    ]
});

console.log(major.title);
console.log(major.subs);
</pre>

## Support

<a href="http://www.it-tweaks.com/" target="_blank">it-tweaks</a>
