frappe.pages['candidates'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Candidate List',
		single_column: true
	});
	new Candidates(page);
}

class Candidates {
	constructor(page) {
		page.set_primary_action('Create', () => this.create_candidate())
		page.set_secondary_action('Refresh', () => this.refresh())
		this.page = page;
		this.make_form();
	}
	make_form() {
		this.form = new frappe.ui.FieldGroup({
			fields: [
				{
					label: __(''),
					fieldname: 'data',
					fieldtype: 'HTML'
				},
			],
			body: this.page.body
		});
		
		this.form.make();
		frappe.call({
			method:"techchallengeapp.public.py.apis.candidate.get_candidates",
			args:{},
			callback:(r)=>{
				let html = ""
				let candidates_list = r.message
				let table = ``
				for(let i in candidates_list){
					table += `
						<tr data-name="${candidates_list[i].name}" data-email="${candidates_list[i].email}" data-experience ="${candidates_list[i].experience}" data-status ="${candidates_list[i].status}">
							<th>${candidates_list[i].name}</th>
							<th>${candidates_list[i].email}</th>
							<th>${candidates_list[i].experience}</th>
							<th>${candidates_list[i].status}</th>
							<td><button onclick="update(this)">Edit</button></td>
						</tr>
					`
				}
				html = `
					<html>
					<head>
					<style>
					table {
					font-family: arial, sans-serif;
					border-collapse: collapse;
					width: 100%;
					}

					td, th {
					border: 1px solid #dddddd;
					text-align: left;
					padding: 8px;
					}

					tr:nth-child(even) {
					background-color: #dddddd;
					}
					</style>
					</head>
					<body>

					<table>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Experience</th>
						<th>Status</th>
						<th></th>
					</tr>
						${table}
					</table>

				</body>
				</html>
				`
				this.form.set_value('data',html)
				$(document).ready(function(){
					$('.editbtn').click(function(r){
						console.log(r)
					});
				});
			}
		})
	}
	create_candidate(){
		let tmp = this
		let d = new frappe.ui.Dialog({
			title: 'Enter details',
			fields: [
				{
					label: 'Name',
					fieldname: 'candidate_name',
					fieldtype: 'Data',
					reqd:1
				},
				{
					label: 'Email',
					fieldname: 'email',
					fieldtype: 'Data',
					reqd:1
				},
				{
					label: 'Experience',
					fieldname: 'experience',
					fieldtype: 'Small Text',
					reqd:1
				}
			],
			size: 'small',
			primary_action_label: 'Create',
			primary_action(values) {
				frappe.call({
					method:"techchallengeapp.public.py.apis.candidate.create_candidate",
					args:{
						candidate_name: values.candidate_name,
						email: values.email,
						experience: values.experience
					},
					callback:(r)=>{
						tmp.refresh()
						let candidate = r.message.name
						frappe.msgprint(`Candidate ${candidate} Created`)
					}
				})
				d.hide();
			}
		});
		
		d.show();
	}
	refresh(){
		this.form.set_value('data','')
		this.make_form()
	}
}
function update(button){
	let data = {
		name: button.parentNode.parentNode.dataset.name,
		email: button.parentNode.parentNode.dataset.email,
		experience: button.parentNode.parentNode.dataset.experience,
		status: button.parentNode.parentNode.dataset.status
	}
	let d = new frappe.ui.Dialog({
		title: 'Enter details',
		fields: [
			{
				label: 'Name',
				fieldname: 'candidate_name',
				fieldtype: 'Data',
				read_only:1,
				default: data.name
			},
			{
				label: 'Email',
				fieldname: 'email',
				fieldtype: 'Data',
				options: 'Email',
				default: data.email
			},
			{
				label: 'Experience',
				fieldname: 'experience',
				fieldtype: 'Small Text',
				default: data.experience
			}
		],
		size: 'small',
		primary_action_label: 'Update',
		primary_action(values) {
			frappe.call({
				method:"techchallengeapp.public.py.apis.candidate.edit_candidates",
				args:{
					candidate: values.candidate_name,
					email: values.email,
					experience: values.experience
				},
				callback:(r)=>{
					document.querySelector('.btn-secondary').click()
					let candidate = r.message.name
					frappe.msgprint(`Candidate ${candidate} Updated`)
				}
			})
			d.hide();
		}
	})
	d.show()
}