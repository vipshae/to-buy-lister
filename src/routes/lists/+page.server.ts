import type { PageServerLoad } from './$types';
import { deleteListByName, getSavedShoppingLists, updateList } from '$db/utils/shoppingList.repository';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { DeleteShoppingListCommand } from '$lib/server/commands/delete-list';

export const load: PageServerLoad = async() : Promise<any> => {
	const savedLists = await getSavedShoppingLists();
	const listsArray: any[] = [];
	savedLists.forEach((listObj) => {
		const neededProps = {
			id: listObj.id,
			name: listObj.name,
			isFinished: listObj.isFinished,
			numOfItems: listObj.items.length
		}
		listsArray.push(neededProps)
	})
	return { listsArray };
}

export const actions: Actions = {
	deleteList: async ({ url }): Promise<any> => {
		const listName = String(url.searchParams.get('shoppingListId'));
		console.log(`Deleting shopping list with name ${listName}`)
		const deleteList: DeleteShoppingListCommand = {
			name: listName
		}
		try {
			const deletedCount = await deleteListByName(deleteList);
			if (deletedCount == 0) return fail(404, {
				error: `Shopping list id ${deleteList.id} not found`
			}) 
		} catch(err: any) {
			return fail(422, {
                error: err.message,
            });
		}
	},
	markListFinished: async ({ request }): Promise<any> => {
		const formData = await request.formData();
		const listName = String(formData.get('listName'));
		console.log('list to be marked completed is:', listName);
		try {
			await updateList({name: listName}, {isFinished: true});
		} catch(err: any) {
			return fail(err?.statusCode || 422, {
                error: err.message,
            });
		}
	}
}