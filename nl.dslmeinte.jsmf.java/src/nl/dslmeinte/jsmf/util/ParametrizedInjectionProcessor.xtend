package nl.dslmeinte.jsmf.util

import com.google.common.annotations.Beta
import com.google.inject.Injector
import java.lang.annotation.ElementType
import java.lang.annotation.Target
import org.eclipse.xtend.lib.macro.AbstractClassProcessor
import org.eclipse.xtend.lib.macro.AbstractFieldProcessor
import org.eclipse.xtend.lib.macro.Active
import org.eclipse.xtend.lib.macro.TransformationContext
import org.eclipse.xtend.lib.macro.declaration.MutableClassDeclaration
import org.eclipse.xtend.lib.macro.declaration.MutableFieldDeclaration
import org.eclipse.xtend.lib.macro.declaration.Visibility

@Active(typeof(ParametrizedInjectionProcessor))
@Target(ElementType::TYPE)
annotation ParametrizedInjected {}

@Active(typeof(ClassParameterChecker))
@Target(ElementType::FIELD)
annotation ClassParameter {}

@Target(ElementType::METHOD)
@Beta
annotation Initialisation {}

class ParametrizedInjectionProcessor extends AbstractClassProcessor {

	override doTransform(MutableClassDeclaration it, extension TransformationContext context) {
		val classParameters = declaredFields.filter[annotations.exists[ a | a.annotationTypeDeclaration.qualifiedName == typeof(ClassParameter).name ]]		// TODO  find more elegant filtering
		if( classParameters.empty ) {
			addError('''class «simpleName» must have @«typeof(ClassParameter).simpleName»s''')
		}
		val initialisations = declaredMethods.filter[annotations.exists[ a | a.annotationTypeDeclaration.qualifiedName == typeof(Initialisation).name ]]	// TODO  find more elegant filtering
		initialisations.forEach[ m |
			if( !m.parameters.empty ) {
				addError('''@Initialisation method «m.simpleName» cannot have parameters''')
			}
		]
		val realInitialisations = initialisations.filter[parameters.empty]
		addConstructor[
			classParameters.forEach[ f | addParameter(f.simpleName, f.type)]
			addParameter("_injector", typeof(Injector).newTypeReference)
			body = [
				'''
				_injector.injectMembers(this);
				«FOR f : classParameters»
					this.«f.simpleName» = «f.simpleName»;
				«ENDFOR»
				«FOR m : realInitialisations»
					«m.simpleName»();
				«ENDFOR»
				'''
			]
		]
		// TODO  make the fields final (produces an error in source now)
		//	classParameters.forEach[final = true]
		realInitialisations.forEach[visibility = Visibility::PROTECTED]
	}

}


class ClassParameterChecker extends AbstractFieldProcessor {

	override doTransform(MutableFieldDeclaration it, extension TransformationContext context) {
		if( !declaringType.annotations.exists[ a | a.annotationTypeDeclaration.qualifiedName == typeof(ParametrizedInjected).name ] ) {
			addError('''@«typeof(ClassParameter).simpleName» can only be used inside a @«typeof(ParametrizedInjected).simpleName» class''')
		}
	}

}
